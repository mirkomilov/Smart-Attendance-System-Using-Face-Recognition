import os
import cv2
import time
import json
import pickle
import hashlib
import threading
import requests
import subprocess
import numpy as np
import face_recognition

from io import BytesIO
from datetime import datetime
from PIL import Image, ImageOps
from dotenv import load_dotenv
from flask import Flask, Response, jsonify
from flask_cors import CORS
from supabase import create_client, Client
from pillow_heif import register_heif_opener

# =========================================================
# HEIC SUPPORT
# =========================================================

register_heif_opener()

# =========================================================
# LOAD ENV
# =========================================================

load_dotenv()

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY")

RTSP_URL = "rtsp://admin:ZSE$xdr5@192.168.1.64:554/stream1"
WIDTH, HEIGHT = 1920, 1080

CACHE_FILE = "face_encodings_cache.pkl"

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Supabase env not found")
    exit(1)

print("✅ Supabase connected")
print("📡 RTSP:", RTSP_URL)

# =========================================================
# SUPABASE
# =========================================================

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# =========================================================
# FLASK
# =========================================================

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

output_frame = None
lock = threading.Lock()

# ✅ Yuzlar ma'lumoti — React UI ga yuboriladi (bbox + name)
latest_faces = []
faces_lock = threading.Lock()

# ✅ Active Session — backgroundda yangilanadi
current_session = None
session_lock = threading.Lock()

# ✅ Face encodings — alohida thread da yuklanadi
known_encodings = []
known_ids = []
known_names = []
encodings_lock = threading.Lock()
encodings_ready = False

# =========================================================
# ACTIVE SESSION
# =========================================================

def get_active_session():

    try:

        response = (
            supabase
            .table("attendance_sessions")
            .select("*")
            .is_("ended_at", None)
            .order("started_at", desc=True)
            .limit(1)
            .execute()
        )

        print("SESSION RESPONSE:", response.data)

        if response.data and len(response.data) > 0:
            print("✅ Active session found")
            return response.data[0]

        print("⚠ No active session")
        return None

    except Exception as e:
        print(f"❌ Session error: {e}")
        return None

# =========================================================
# CACHE
# =========================================================

def url_to_hash(url):
    return hashlib.md5(url.encode()).hexdigest()

def load_cache():
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, "rb") as f:
                cache = pickle.load(f)
                print(f"✅ Cache loaded: {len(cache)} images")
                return cache
        except Exception as e:
            print(f"⚠ Cache read error: {e}")
    return {}

def save_cache(cache):
    try:
        with open(CACHE_FILE, "wb") as f:
            pickle.dump(cache, f)
        print(f"💾 Cache saved: {len(cache)} images")
    except Exception as e:
        print(f"⚠ Cache save error: {e}")

# =========================================================
# LOAD STUDENTS
# =========================================================

def load_student_faces():
    print("📡 Loading students...")

    known_encodings = []
    known_ids = []
    known_names = []

    try:
        students_response = supabase.table("students").select("*").execute()
        images_response = supabase.table("student_images").select("*").execute()
        students = students_response.data
        images = images_response.data
    except Exception as e:
        print(f"❌ Supabase error: {e}")
        return [], [], []

    cache = load_cache()
    cache_updated = False

    images_map = {}
    for img in images:
        sid = img["student_id"]
        if sid not in images_map:
            images_map[sid] = []
        images_map[sid].append(img["image_url"])

    print(f"👥 Students found: {len(students)}")

    for student in students:
        student_id = student["id"]
        full_name = student["full_name"]

        image_urls = []
        if student.get("profile_picture"):
            image_urls.append(student["profile_picture"])
        if student_id in images_map:
            image_urls.extend(images_map[student_id])
        image_urls = list(set(image_urls))

        encoded_count = 0

        for image_url in image_urls:
            try:
                if image_url.startswith("http"):
                    final_url = image_url
                else:
                    final_url = (
                        f"{SUPABASE_URL}/storage/v1/object/public/"
                        f"student-images/{image_url}"
                    )

                url_hash = url_to_hash(final_url)

                if url_hash in cache:
                    encodings = cache[url_hash]
                    print(f"  ⚡ Cache hit: {final_url.split('/')[-1]} ({len(encodings)} faces)")
                else:
                    print(f"  ⬇ Downloading: {final_url}")
                    
                    max_retries = 3
                    response = None
                    for attempt in range(max_retries):
                        try:
                            response = requests.get(final_url, timeout=10)
                            if response.status_code == 200:
                                break
                        except Exception as e:
                            if attempt == max_retries - 1:
                                raise e
                            time.sleep(1)

                    if not response or response.status_code != 200:
                        status_code = response.status_code if response else "Unknown"
                        print(f"  ❌ Download failed: {status_code}")
                        continue

                    pil_image = Image.open(BytesIO(response.content))
                    
                    # ✅ FIX: Apply EXIF orientation so phone pictures aren't sideways
                    pil_image = ImageOps.exif_transpose(pil_image)

                    # ✅ TUZATISH: Rasmni kichraytirish
                    max_size = 800
                    w, h = pil_image.size
                    if w > max_size or h > max_size:
                        ratio = min(max_size / w, max_size / h)
                        new_w = int(w * ratio)
                        new_h = int(h * ratio)
                        pil_image = pil_image.resize((new_w, new_h), Image.LANCZOS)
                        print(f"  → resized: {w}x{h} → {new_w}x{new_h}")

                    image = np.array(pil_image.convert("RGB"))
                    print(f"  → shape: {image.shape}")

                    # ✅ TUZATISH: avval face_locations topamiz
                    face_locations = face_recognition.face_locations(
                        image,
                        number_of_times_to_upsample=2,
                        model="hog"
                    )
                    print(f"  → face locations found: {len(face_locations)}")

                    if not face_locations:
                        print(f"  ⚠ No face found, skipping")
                        cache[url_hash] = []
                        cache_updated = True
                        continue

                    # ✅ TUZATISH: face_locations bilan birga encode qilamiz
                    encodings = face_recognition.face_encodings(
                        image,
                        known_face_locations=face_locations,
                        num_jitters=2,
                        model="large"
                    )
                    print(f"  → encoded: {len(encodings)}")

                    cache[url_hash] = encodings
                    cache_updated = True

                for enc in encodings:
                    known_encodings.append(enc)
                    known_ids.append(student_id)
                    known_names.append(full_name)
                    encoded_count += 1

            except Exception as e:
                print(f"⚠ {full_name}: {e}")

        print(f"✅ {full_name}: {encoded_count} encoded")

    if cache_updated:
        save_cache(cache)

    return known_encodings, known_ids, known_names

# =========================================================
# MARK ATTENDANCE
# =========================================================

def mark_attendance(student_id, session_id, name):
    try:
        existing = (
            supabase
            .table("attendance_records")
            .select("id")
            .eq("student_id", student_id)
            .eq("session_id", session_id)
            .execute()
        )
        if existing.data:
            return

        supabase.table("attendance_records").insert({
            "student_id": student_id,
            "session_id": session_id,
            "status": "present",
            "confidence": 0.95,
            "detected_at": datetime.now().isoformat()
        }).execute()

        print(f"📝 Marked: {name}")

    except Exception as e:
        print(f"❌ Attendance error: {e}")

# =========================================================
# CONNECT CAMERA
# =========================================================

def open_ffmpeg_pipe(url: str) -> subprocess.Popen:
    cmd = [
        "ffmpeg",
        "-loglevel", "error",
        "-rtsp_transport", "tcp",
        "-i", url,
        "-vf", f"scale={WIDTH}:{HEIGHT}",
        "-f", "rawvideo",
        "-pix_fmt", "bgr24",
        "pipe:1",
    ]
    print("📷 Connecting camera via ffmpeg pipe...")
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
    print("✅ Camera pipe opened")
    return proc

# =========================================================
# CAMERA LOOP
# =========================================================

def face_loader_loop():
    """Background thread: face encodinglarni yuklaydi va yangilab turadi."""
    global known_encodings, known_ids, known_names, encodings_ready

    while True:
        print("📡 [FaceLoader] Student faces yuklanmoqda...")
        try:
            enc, ids, names = load_student_faces()
            with encodings_lock:
                known_encodings = enc
                known_ids = ids
                known_names = names
                encodings_ready = True
            if enc:
                print(f"✅ [FaceLoader] {len(enc)} encoding yuklandi")
            else:
                print("⚠ [FaceLoader] Yuzlar topilmadi — 60s dan keyin qayta uriniladi")
        except Exception as e:
            print(f"❌ [FaceLoader] Xatolik: {e} — 60s dan keyin qayta uriniladi")

        # Har 5 daqiqada yangilab turadi (yoki xatolikda 60s)
        time.sleep(300 if known_encodings else 60)


def session_checker_loop():
    """Sessiyani har 10 soniyada backgroundda tekshiradi"""
    global current_session
    while True:
        s = get_active_session()
        with session_lock:
            current_session = s
        time.sleep(10)


def recognition_loop():
    global output_frame, latest_faces

    # ✅ Kamera DARHOL ochiladi — face loading kutilmaydi
    proc = open_ffmpeg_pipe(RTSP_URL)
    frame_size = WIDTH * HEIGHT * 3

    # Kamera kadrida kichraytirish koeffitsienti
    scale = 0.3  # Yana biroz kichraytirdik tezlik uchun
    tolerance = 0.5

    frame_count = 0
    
    # Oxirgi topilgan yuzlar (chizish uchun)
    active_boxes = [] 


    while True:
        raw = proc.stdout.read(frame_size)

        if not raw or len(raw) < frame_size:
            print("⚠ Stream lost, reconnecting...")
            proc.kill()
            time.sleep(2)
            proc = open_ffmpeg_pipe(RTSP_URL)
            continue

        frame = np.frombuffer(raw, dtype=np.uint8).reshape((HEIGHT, WIDTH, 3)).copy()
        frame_count += 1

        # Har 3-kadrda yuzni taniymiz (FPSni saqlash uchun)
        process_this_frame = (frame_count % 3 == 0)

        if process_this_frame:
            current_faces = []
            # Thread-safe encodings olish
            with encodings_lock:
                enc_snapshot = list(known_encodings)
                ids_snapshot = list(known_ids)
                names_snapshot = list(known_names)

            if enc_snapshot:
                try:
                    small_frame = cv2.resize(frame, (0, 0), fx=scale, fy=scale)
                    rgb_small = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)

                    face_locations = face_recognition.face_locations(
                        rgb_small,
                        number_of_times_to_upsample=1,
                        model="hog"
                    )

                    face_encodings_list = face_recognition.face_encodings(
                        rgb_small,
                        known_face_locations=face_locations,
                        num_jitters=0,
                        model="small"
                    )

                    new_active_boxes = []
                    for face_encoding, face_location in zip(face_encodings_list, face_locations):
                        name = "Unknown"
                        student_id = None
                        recognized = False

                        distances = face_recognition.face_distance(enc_snapshot, face_encoding)
                        if len(distances) > 0:
                            best_index = np.argmin(distances)
                            if distances[best_index] <= tolerance:
                                name = names_snapshot[best_index]
                                student_id = ids_snapshot[best_index]
                                recognized = True
                                
                                with session_lock:
                                    session = current_session
                                if session:
                                    mark_attendance(student_id, session["id"], name)

                        top, right, bottom, left = [int(v / scale) for v in face_location]
                        new_active_boxes.append({
                            "name": name,
                            "recognized": recognized,
                            "box": (top, right, bottom, left)
                        })
                        current_faces.append({
                            "name": name,
                            "recognized": recognized,
                            "box": {"top": top, "right": right, "bottom": bottom, "left": left}
                        })
                    
                    active_boxes = new_active_boxes
                    with faces_lock:
                        latest_faces = current_faces

                except Exception as e:
                    print(f"❌ Face recognition error: {e}")

        # Har bir kadrda chizamiz
        for face in active_boxes:
            top, right, bottom, left = face["box"]
            name = face["name"]
            recognized = face["recognized"]
            color = (0, 220, 100) if recognized else (60, 60, 255)

            cv2.rectangle(frame, (left, top), (right, bottom), color, 2)
            (tw, th), _ = cv2.getTextSize(name, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
            cv2.rectangle(frame, (left, top - th - 10), (left + tw + 10, top), color, -1)
            cv2.putText(frame, name, (left + 5, top - 7), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

        with lock:
            output_frame = frame.copy()

# =========================================================
# VIDEO STREAM
# =========================================================

def generate_frames():
    global output_frame

    while True:
        with lock:
            frame_copy = output_frame.copy() if output_frame is not None else None

        if frame_copy is None:
            time.sleep(0.1)
            continue

        success, encoded_image = cv2.imencode(
            ".jpg", frame_copy,
            [cv2.IMWRITE_JPEG_QUALITY, 85]
        )
        if not success:
            continue

        yield (
            b"--frame\r\n"
            b"Content-Type: image/jpeg\r\n\r\n"
            + encoded_image.tobytes()
            + b"\r\n"
        )

        time.sleep(0.03)

# =========================================================
# ROUTES
# =========================================================

@app.route("/")
def home():
    return {"status": "running"}

@app.route("/video_feed")
def video_feed():
    return Response(
        generate_frames(),
        mimetype="multipart/x-mixed-replace; boundary=frame"
    )

@app.route("/faces")
def faces():
    """Hozirda kamerada ko'rinayotgan yuzlar ro'yxati"""
    with faces_lock:
        data = list(latest_faces)
    return jsonify(data)

@app.route("/clear_cache", methods=["POST"])
def clear_cache():
    if os.path.exists(CACHE_FILE):
        os.remove(CACHE_FILE)
        return {"status": "cache cleared"}
    return {"status": "no cache found"}

# =========================================================
# MAIN
# =========================================================

if __name__ == "__main__":
    # 1️⃣ Face loader (background)
    threading.Thread(target=face_loader_loop, daemon=True).start()

    # 2️⃣ Session checker (background)
    threading.Thread(target=session_checker_loop, daemon=True).start()

    # 3️⃣ Kamera loop (background)
    threading.Thread(target=recognition_loop, daemon=True).start()

    print("🚀 Server started")
    print("📺 http://localhost:8000/video_feed")
    app.run(host="0.0.0.0", port=8000, debug=False, threaded=True)