import os
import cv2
import time
import threading
import requests
import subprocess
import numpy as np
import face_recognition

from io import BytesIO
from datetime import datetime
from PIL import Image
from dotenv import load_dotenv
from flask import Flask, Response
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

# Camera config — ffmpeg subprocess pipe (cv2.VideoCapture has no FFMPEG on macOS pip builds)
RTSP_URL = "rtsp://admin:ZSE$xdr5@192.168.1.64:554/stream1"
WIDTH, HEIGHT = 1920, 1080

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Supabase env not found")
    exit(1)

print("✅ Supabase connected")
print("📡 RTSP:", RTSP_URL)

# =========================================================
# SUPABASE
# =========================================================

supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)

# =========================================================
# FLASK
# =========================================================

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

output_frame = None
lock = threading.Lock()

# =========================================================
# ACTIVE SESSION
# =========================================================

def get_active_session():

    try:

        response = (
            supabase
            .table("attendance_sessions")
            .select("*")
            .is_("ended_at", "null")
            .order("started_at", desc=True)
            .limit(1)
            .execute()
        )

        if response.data:
            return response.data[0]

        return None

    except Exception as e:
        print(f"❌ Session error: {e}")
        return None

# =========================================================
# LOAD STUDENTS
# =========================================================

def load_student_faces():

    print("📡 Loading students...")

    known_encodings = []
    known_ids = []
    known_names = []

    try:

        students_response = (
            supabase
            .table("students")
            .select("*")
            .execute()
        )

        images_response = (
            supabase
            .table("student_images")
            .select("*")
            .execute()
        )

        students = students_response.data
        images = images_response.data

    except Exception as e:
        print(f"❌ Supabase error: {e}")
        return [], [], []

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

                print("⬇ Downloading:", final_url)

                response = requests.get(
                    final_url,
                    timeout=10
                )

                if response.status_code != 200:
                    print(f"❌ Download failed: {response.status_code}")
                    continue

                pil_image = Image.open(
                    BytesIO(response.content)
                )

                image = np.array(
                    pil_image.convert("RGB")
                )

                # DEBUG: rasm o'lchamini ko'rish
                print(f"  → image shape: {image.shape}")

                encodings = face_recognition.face_encodings(image)

                # DEBUG: nechta yuz topilganini ko'rish
                print(f"  → faces found: {len(encodings)}")

                for enc in encodings:

                    known_encodings.append(enc)
                    known_ids.append(student_id)
                    known_names.append(full_name)

                    encoded_count += 1

            except Exception as e:
                print(f"⚠ {full_name}: {e}")

        print(f"✅ {full_name}: {encoded_count} encoded")

    return known_encodings, known_ids, known_names

# =========================================================
# MARK ATTENDANCE
# =========================================================

def mark_attendance(student_id, session_id, name):

    try:

        existing = (
            supabase
            .table("attendance_records")
            .select("*")
            .eq("student_id", student_id)
            .eq("session_id", session_id)
            .execute()
        )

        if existing.data:
            return

        data = {
            "student_id": student_id,
            "session_id": session_id,
            "status": "present",
            "confidence": 0.95,
            "detected_at": datetime.now().isoformat()
        }

        (
            supabase
            .table("attendance_records")
            .insert(data)
            .execute()
        )

        print(f"📝 Attendance marked: {name}")

    except Exception as e:
        print(f"❌ Attendance error: {e}")

# =========================================================
# CONNECT CAMERA (ffmpeg subprocess pipe)
# =========================================================

def open_ffmpeg_pipe(url: str) -> subprocess.Popen:
    """Spawn ffmpeg outputting raw BGR24 frames to stdout."""
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
    proc = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL
    )
    print("✅ Camera pipe opened")
    return proc

# =========================================================
# CAMERA LOOP
# =========================================================

def recognition_loop():

    global output_frame

    known_encodings, known_ids, known_names = load_student_faces()

    if not known_encodings:
        print("⚠ No faces loaded — camera-only mode (face recognition OFF)")
    else:
        print(f"✅ Face recognition ON — {len(known_encodings)} encodings loaded")

    proc = open_ffmpeg_pipe(RTSP_URL)
    frame_size = WIDTH * HEIGHT * 3  # raw BGR bytes per frame

    scale = 0.5
    tolerance = 0.5

    session = get_active_session()
    last_session_check = 0
    frame_count = 0

    while True:

        raw = proc.stdout.read(frame_size)

        if len(raw) < frame_size:
            print("⚠ Stream lost, reconnecting...")
            proc.kill()
            time.sleep(2)
            proc = open_ffmpeg_pipe(RTSP_URL)
            continue

        # Convert raw bytes → writable numpy BGR frame
        frame = np.frombuffer(raw, dtype=np.uint8).reshape((HEIGHT, WIDTH, 3)).copy()

        frame_count += 1

        if frame_count % 100 == 0:
            print(f"📺 Streaming... frame #{frame_count}")

        # SESSION UPDATE — every 10 seconds
        if time.time() - last_session_check > 10:
            session = get_active_session()
            last_session_check = time.time()

        # Face recognition (only when encodings are loaded)
        if known_encodings:

            try:

                small_frame = cv2.resize(
                    frame,
                    (0, 0),
                    fx=scale,
                    fy=scale
                )

                rgb_small = cv2.cvtColor(
                    small_frame,
                    cv2.COLOR_BGR2RGB
                )

                face_locations = face_recognition.face_locations(rgb_small)

                face_encodings = face_recognition.face_encodings(
                    rgb_small,
                    face_locations
                )

                for face_encoding, face_location in zip(
                    face_encodings,
                    face_locations
                ):

                    name = "Unknown"
                    student_id = None

                    distances = face_recognition.face_distance(
                        known_encodings,
                        face_encoding
                    )

                    best_index = np.argmin(distances)

                    if distances[best_index] <= tolerance:
                        name = known_names[best_index]
                        student_id = known_ids[best_index]

                        if session:
                            mark_attendance(
                                student_id,
                                session["id"],
                                name
                            )

                    top, right, bottom, left = [
                        int(v / scale) for v in face_location
                    ]

                    color = (0, 255, 0) if student_id else (0, 0, 255)

                    cv2.rectangle(
                        frame,
                        (left, top),
                        (right, bottom),
                        color,
                        2
                    )

                    cv2.putText(
                        frame,
                        name,
                        (left, top - 10),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.7,
                        color,
                        2
                    )

            except Exception as e:
                print("❌ Face recognition error:", e)

        # Write annotated frame for MJPEG stream
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

        success, encoded_image = cv2.imencode(".jpg", frame_copy)

        if not success:
            continue

        frame_bytes = encoded_image.tobytes()

        yield (
            b"--frame\r\n"
            b"Content-Type: image/jpeg\r\n\r\n"
            + frame_bytes
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

# =========================================================
# MAIN
# =========================================================

if __name__ == "__main__":

    thread = threading.Thread(target=recognition_loop)
    thread.daemon = True
    thread.start()

    print("🚀 Server started")
    print("📺 http://localhost:8000/video_feed")

    app.run(
        host="0.0.0.0",
        port=8000,
        debug=False,       # ✅ False — ikki marta ishga tushurishni oldini oladi
        threaded=True
    )