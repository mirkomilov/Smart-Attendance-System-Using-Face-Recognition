import { supabase } from "../lib/supabase";

/** ---------- Helpers ---------- **/
function ok(data) {
  return { data, error: null };
}

function fail(error) {
  console.error("[API ERROR]", error);
  return { data: null, error };
}

/** ---------- Auth ---------- **/

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) return fail(error);
  return ok(data.user ?? null);
}

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) return fail(error);
  return ok(data.user);
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) return fail(error);
  return ok(true);
}

/** ---------- User Profile (ROLE DETECT) ---------- **/

export async function getUserProfile(userId) {
  const { data: student } = await supabase
    .from("students")
    .select(`
      id,
      full_name,
      email,
      student_code,
      profile_picture,
      group_id,
      faculty_id,
      user_id,
      groups ( name ),
      faculty ( name )
    `)
    .eq("user_id", userId)
    .single();

  if (student) return ok({ ...student, role: "student" });

  const { data: professor } = await supabase
    .from("professors")
    .select(`
      id,
      full_name,
      email,
      user_id
    `)
    .eq("user_id", userId)
    .single();

  if (professor) return ok({ ...professor, role: "professor" });

  return ok(null);
}

/** ---------- Schedule ---------- **/

export async function getTodaySchedule(day) {
  const { data, error } = await supabase
    .from("schedules")
    .select(`
      id,
      day_of_week,
      start_time,
      end_time,
      courses ( name ),
      professors ( full_name ),
      rooms ( name )
    `)
    .eq("day_of_week", day)
    .order("start_time");

  if (error) return fail(error);
  return ok(data);
}

/** ---------- Monthly Sessions (Calendar dots) ---------- **/

export async function getMonthlySessions() {
  const { data, error } = await supabase
    .from("attendance_sessions")
    .select("date");

  if (error) return fail(error);
  return ok(data);
}

/** ---------- Attendance by Student ---------- **/

export async function getAttendanceByStudent(studentId) {
  const { data, error } = await supabase
    .from("attendance_records")
    .select(`
      status,
      detected_at,
      attendance_sessions (
        date,
        schedules (
          courses ( name )
        )
      )
    `)
    .eq("student_id", studentId);

  if (error) return fail(error);
  return ok(data);
}

/** ---------- Attendance Session Create ---------- **/

export async function createAttendanceSession(scheduleId) {
  const { data, error } = await supabase
    .from("attendance_sessions")
    .insert({
      schedule_id: scheduleId,
      date: new Date().toISOString().split("T")[0],
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return fail(error);
  return ok(data);
}

/** ---------- End Session ---------- **/

export async function endAttendanceSession(sessionId) {
  const { data, error } = await supabase
    .from("attendance_sessions")
    .update({
      ended_at: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .select()
    .single();

  if (error) return fail(error);
  return ok(data);
}

/** ---------- Attendance Record ---------- **/

export async function markAttendance({
  session_id,
  student_id,
  status = "present",
  confidence = 0.9,
}) {
  const { data, error } = await supabase
    .from("attendance_records")
    .insert({
      session_id,
      student_id,
      status,
      detected_at: new Date().toISOString(),
      confidence,
    });

  if (error) return fail(error);
  return ok(data);
}

/** ---------- Dashboard & Reports Data ---------- **/

export async function getStudentSchedule(groupId) {
  if (!groupId) return ok([]);
  const { data, error } = await supabase
    .from("schedules")
    .select(`
      id,
      day_of_week,
      start_time,
      end_time,
      courses ( name ),
      professors ( full_name ),
      rooms ( name )
    `)
    .eq("group_id", groupId)
    .order("start_time");
  if (error) return fail(error);
  return ok(data || []);
}

export async function getProfessorSchedule(professorId) {
  const { data, error } = await supabase
    .from("schedules")
    .select(`
      id,
      day_of_week,
      start_time,
      end_time,
      type,
      courses ( name ),
      rooms ( name ),
      groups ( id, name )
    `)
    .eq("professor_id", professorId);
  if (error) return fail(error);
  return ok(data || []);
}

export async function getProfessorSubjects(professorId) {
  if (!professorId) return ok([]);
  const { data, error } = await supabase
    .from("schedules")
    .select(`courses ( id, name )`)
    .eq("professor_id", professorId);

  if (error) return fail(error);

  const seen = new Set();
  const unique = (data || [])
    .map(s => s.courses)
    .filter(c => {
      if (!c || seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    });

  return ok(unique);
}

export async function getProfessorGroups(professorId) {
  if (!professorId) return ok([]);
  const { data, error } = await supabase
    .from("schedules")
    .select(`groups ( id, name )`)
    .eq("professor_id", professorId);

  if (error) return fail(error);

  const seen = new Set();
  const unique = (data || [])
    .map(s => s.groups)
    .filter(g => {
      if (!g || seen.has(g.id)) return false;
      seen.add(g.id);
      return true;
    });

  return ok(unique);
}

export async function getEnrolledCourses(groupId) {
  if (!groupId) return ok([]);
  const { data, error } = await supabase
    .from("schedules")
    .select(`
      id,
      day_of_week,
      start_time,
      end_time,
      type,
      courses ( id, name ),
      professors ( full_name ),
      rooms ( name )
    `)
    .eq("group_id", groupId);
  if (error) return fail(error);

  const seen = new Set();
  const unique = (data || []).filter(s => {
    const key = s.courses?.id;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return ok(unique);
}

export async function getLiveMonitoringData(sessionId) {
  if (!sessionId) return ok([]);
  const { data, error } = await supabase
    .from("attendance_records")
    .select(`
      id,
      status,
      detected_at,
      confidence,
      student_id,
      students ( id, student_code, full_name )
    `)
    .eq("session_id", sessionId);
  if (error) return fail(error);
  return ok(data || []);
}

/** ---------- Active Session ---------- **/
// ✅ TUZATISH: professorId ixtiyoriy, schedules → courses + groups ham yuklanadi

export async function getActiveSession(professorId = null) {
  let query = supabase
    .from("attendance_sessions")
    .select(`
      *,
      schedules (
        id,
        group_id,
        professor_id,
        courses ( id, name ),
        groups ( id, name ),
        rooms ( name )
      )
    `)
    .is("ended_at", null)
    .order("started_at", { ascending: false })
    .limit(1);

  // Agar professorId berilgan bo'lsa — faqat shu professorning sessiyasi
  if (professorId) {
    query = query.eq("schedules.professor_id", professorId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) return fail(error);
  return ok(data || null);
}

export async function getGroupStudents(groupId = null) {
  let query = supabase
    .from("students")
    .select("id, student_code, full_name, group_id, groups ( name )")
    .order("full_name");

  if (groupId) {
    query = query.eq("group_id", groupId);
  }

  const { data, error } = await query;
  if (error) return fail(error);
  return ok(data || []);
}

export async function getAllAttendance() {
  const { data, error } = await supabase
    .from("attendance_records")
    .select(`
      status,
      student_id,
      attendance_sessions ( date )
    `);
  if (error) return fail(error);
  return ok(data || []);
}