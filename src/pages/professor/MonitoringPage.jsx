import { useState, useEffect, useMemo } from 'react'
import { Scan, Users, CheckCircle, XCircle } from 'lucide-react'

import Card from '../../components/ui/Card'
import { cn } from '../../lib/cn'

import {
  getActiveSession,
  getLiveMonitoringData,
  getGroupStudents,
} from '../../api/api'

function MonitoringPage() {
  const [allStudents, setAllStudents] = useState([])
  const [monitoringData, setMonitoringData] = useState([])
  const [activeSession, setActiveSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [streamError, setStreamError] = useState(false)

  // group_id ni bir karta yuklab oldik degan flag
  const [groupLoaded, setGroupLoaded] = useState(false)

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  // stream URL — komponent mount bo'lganda bir marta hosil qilinadi
  const streamUrl = useMemo(
    () => `${BACKEND_URL}/video_feed?t=${Date.now()}`,
    [BACKEND_URL]
  )

  // =====================================================
  // LOAD DATA — har 5 sekundda yangilanadi
  // =====================================================

  useEffect(() => {
    let interval

    async function loadData() {
      try {
        // 1. Aktiv sessiyani ol
        // api.js da getActiveSession() endi schedules → courses + groups bilan keladi
        const { data: session } = await getActiveSession()

        if (!session) {
          setActiveSession(null)
          setLoading(false)
          return
        }

        setActiveSession(session)

        // 2. Guruhning barcha talabalarini BIR MARTA yuklaymiz
        // session.schedules.group_id — yangi api.js dan keladi
        const groupId = session?.schedules?.group_id ?? null

        if (groupId && !groupLoaded) {
          const { data: students } = await getGroupStudents(groupId)
          if (students && students.length > 0) {
            setAllStudents(students)
            setGroupLoaded(true)
          }
        }

        // 3. Present bo'lgan talabalarni ol (har 5 sek yangilanadi)
        const { data: records } = await getLiveMonitoringData(session.id)

        if (records) {
          const formatted = records.map((r) => ({
            id: r.id,
            studentDbId: r.student_id,
            name: r.students?.full_name || 'Unknown',
            studentCode: r.students?.student_code || 'N/A',
            status: 'present',
            time: new Date(r.detected_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            confidence: r.confidence
              ? `${Math.round(r.confidence * 100)}%`
              : '—',
          }))
          setMonitoringData(formatted)
        }

        setLoading(false)
      } catch (error) {
        console.error('Monitoring load error:', error)
        setLoading(false)
      }
    }

    loadData()
    interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [groupLoaded])

  // =====================================================
  // STATS
  // =====================================================

  const presentIds = useMemo(
    () => new Set(monitoringData.map((r) => r.studentDbId)),
    [monitoringData]
  )

  const totalCount = allStudents.length
  const presentCount = presentIds.size
  const absentCount = totalCount - presentCount
  const presentPercent =
    totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0

  // =====================================================
  // FULL LIST — barcha talabalar, present + absent
  // =====================================================

  const fullStudentList = useMemo(() => {
    // Guruh talabalari yuklanmagan bo'lsa — faqat detected larni ko'rsat
    if (allStudents.length === 0) return monitoringData

    return allStudents.map((student) => {
      const record = monitoringData.find(
        (r) => r.studentDbId === student.id
      )

      if (record) {
        // Kamera tomonidan topilgan — Present
        return {
          ...record,
          status: 'present',
        }
      }

      // Kamera tomonidan topilmagan — Absent
      return {
        id: `absent-${student.id}`,
        studentDbId: student.id,
        name: student.full_name,
        studentCode: student.student_code || 'N/A',
        status: 'absent',
        time: '—',
        confidence: '—',
      }
    })
  }, [allStudents, monitoringData])

  // =====================================================
  // SESSION INFO STRING
  // =====================================================

  const sessionInfo = useMemo(() => {
    if (!activeSession) return null
    const course = activeSession.schedules?.courses?.name
    const group = activeSession.schedules?.groups?.name
    const parts = [course, group].filter(Boolean)
    return parts.length > 0 ? parts.join(' — ') : `Session #${activeSession.id}`
  }, [activeSession])

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="space-y-8">

      {/* SESSION BANNER */}
      {activeSession ? (
        <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-2xl">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse flex-shrink-0" />
          <span className="text-sm font-semibold text-blue-700">
            Active Session — {sessionInfo}
          </span>
          <span className="ml-auto text-xs text-blue-400 font-medium">
            {totalCount} students · {presentCount} present
          </span>
        </div>
      ) : (
        !loading && (
          <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl">
            <span className="text-sm font-semibold text-amber-700">
              No active session. Start a session from the Schedule page.
            </span>
          </div>
        )
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ================================================= */}
        {/* LIVE STREAM */}
        {/* ================================================= */}

        <Card
          className="lg:col-span-2"
          title="Live Camera Feed"
          subtitle={sessionInfo ?? 'No active session'}
        >
          <div className="relative aspect-video bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
            {!streamError ? (
              <img
                src={streamUrl}
                alt="Live Stream"
                className="w-full h-full object-cover"
                onError={() => setStreamError(true)}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/50">
                    <Scan size={32} className="text-rose-500" />
                  </div>
                  <h4 className="text-white font-bold mb-2">
                    Backend Connection Lost
                  </h4>
                  <p className="text-slate-400 text-sm max-w-xs mx-auto">
                    Make sure Python backend is running on port 8000.
                  </p>
                  <button
                    onClick={() => setStreamError(false)}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all"
                  >
                    Retry Connection
                  </button>
                </div>
              </div>
            )}

            {/* LIVE BADGE */}
            <div className="absolute top-6 right-6">
              <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-xs text-white font-bold uppercase tracking-widest">
                    Live Feed
                  </span>
                </div>
              </div>
            </div>

            <div className="absolute bottom-6 left-6">
              <div className="px-3 py-1 bg-blue-600/20 border border-blue-600/50 rounded-md text-[10px] text-blue-400 font-bold uppercase tracking-wider">
                Python MJPEG Stream
              </div>
            </div>
          </div>
        </Card>

        {/* ================================================= */}
        {/* STATS */}
        {/* ================================================= */}

        <Card title="Detection Stats">
          <div className="space-y-6">

            {/* COUNTS */}
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-3 bg-slate-50 rounded-2xl">
                <p className="text-2xl font-bold text-slate-900">{totalCount}</p>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mt-1">
                  Total
                </p>
              </div>
              <div className="text-center p-3 bg-emerald-50 rounded-2xl">
                <p className="text-2xl font-bold text-emerald-600">{presentCount}</p>
                <p className="text-[10px] text-emerald-500 font-semibold uppercase tracking-wide mt-1">
                  Present
                </p>
              </div>
              <div className="text-center p-3 bg-rose-50 rounded-2xl">
                <p className="text-2xl font-bold text-rose-500">{absentCount}</p>
                <p className="text-[10px] text-rose-400 font-semibold uppercase tracking-wide mt-1">
                  Absent
                </p>
              </div>
            </div>

            {/* PROGRESS BAR */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-slate-500">Attendance Rate</span>
                <span className="text-emerald-600">{presentPercent}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-1000 ease-out"
                  style={{ width: `${presentPercent}%` }}
                />
              </div>
            </div>

            {/* RECENT DETECTIONS */}
            <div className="space-y-3 pt-2">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                Recent Detections
              </h4>

              {monitoringData.slice(0, 5).map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 bg-white hover:bg-slate-50 rounded-2xl border border-slate-100 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 text-sm font-bold">
                      {student.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {student.name}
                      </p>
                      <p className="text-[10px] text-slate-400">{student.time}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                    {student.confidence}
                  </span>
                </div>
              ))}

              {!loading && monitoringData.length === 0 && (
                <div className="text-sm text-slate-400 text-center py-8 italic border-2 border-dashed border-slate-100 rounded-2xl">
                  Waiting for detections...
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* ================================================= */}
      {/* FULL STUDENTS TABLE */}
      {/* ================================================= */}

      <Card
        title="Attendance Real-time List"
        subtitle={
          activeSession?.schedules?.groups?.name
            ? `Group: ${activeSession.schedules.groups.name}`
            : undefined
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-slate-100">
                <th className="pb-4 px-4 text-slate-400 text-[10px] font-semibold uppercase tracking-widest">
                  #
                </th>
                <th className="pb-4 px-4 text-slate-400 text-[10px] font-semibold uppercase tracking-widest">
                  Student Name
                </th>
                <th className="pb-4 px-4 text-slate-400 text-[10px] font-semibold uppercase tracking-widest">
                  Student ID
                </th>
                <th className="pb-4 px-4 text-slate-400 text-[10px] font-semibold uppercase tracking-widest">
                  Status
                </th>
                <th className="pb-4 px-4 text-slate-400 text-[10px] font-semibold uppercase tracking-widest">
                  Detected At
                </th>
                <th className="pb-4 px-4 text-slate-400 text-[10px] font-semibold uppercase tracking-widest">
                  Confidence
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {fullStudentList.map((item, index) => (
                <tr
                  key={item.id}
                  className={cn(
                    'transition-colors',
                    item.status === 'present'
                      ? 'hover:bg-emerald-50/40'
                      : 'hover:bg-rose-50/30'
                  )}
                >
                  {/* # */}
                  <td className="py-4 px-4 text-slate-400 text-sm">
                    {index + 1}
                  </td>

                  {/* NAME */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold',
                          item.status === 'present'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-400'
                        )}
                      >
                        {item.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-900">
                        {item.name}
                      </span>
                    </div>
                  </td>

                  {/* STUDENT CODE */}
                  <td className="py-4 px-4 text-slate-500 text-sm font-medium">
                    {item.studentCode}
                  </td>

                  {/* STATUS */}
                  <td className="py-4 px-4">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight',
                        item.status === 'present'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-rose-50 text-rose-500'
                      )}
                    >
                      {item.status === 'present' ? (
                        <CheckCircle size={11} />
                      ) : (
                        <XCircle size={11} />
                      )}
                      {item.status}
                    </span>
                  </td>

                  {/* TIME */}
                  <td className="py-4 px-4 text-slate-500 text-sm font-medium">
                    {item.time}
                  </td>

                  {/* CONFIDENCE */}
                  <td className="py-4 px-4 text-sm font-bold">
                    <span
                      className={
                        item.status === 'present'
                          ? 'text-emerald-600'
                          : 'text-slate-300'
                      }
                    >
                      {item.confidence}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* EMPTY STATE */}
          {!loading && fullStudentList.length === 0 && (
            <div className="py-14 text-center">
              <Users size={36} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 text-sm font-medium">
                {activeSession
                  ? 'No students found for this group.'
                  : 'No active session. Start a session to see attendance.'}
              </p>
            </div>
          )}

          {/* LOADING STATE */}
          {loading && (
            <div className="py-14 text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Loading...</p>
            </div>
          )}
        </div>
      </Card>

    </div>
  )
}

export default MonitoringPage