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
  // student tekshiramiz
  const { data: student } = await supabase
    .from("students")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (student) return ok({ ...student, role: "student" });

  // professor tekshiramiz
  const { data: professor } = await supabase
    .from("professors")
    .select("*")
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

/** ---------- Attendance Record (Python yozadi, lekin test uchun) ---------- **/

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