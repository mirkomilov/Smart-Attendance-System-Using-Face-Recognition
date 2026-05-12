import { useState, useEffect, useMemo } from 'react'
import { MoreVertical, Scan } from 'lucide-react'

import Card from '../../components/ui/Card'
import { cn } from '../../lib/cn'

import {
  getActiveSession,
  getLiveMonitoringData,
} from '../../api/api'

function MonitoringPage() {
  const [monitoringData, setMonitoringData] = useState([])
  const [activeSession, setActiveSession] = useState(null)

  const [loading, setLoading] = useState(true)
  const [streamError, setStreamError] = useState(false)

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL ||
    'http://localhost:8000'

  const streamUrl = useMemo(() => {
    return `${BACKEND_URL}/video_feed?t=${Date.now()}`
  }, [BACKEND_URL])

  // =====================================================
  // LOAD MONITORING DATA
  // =====================================================

  useEffect(() => {
    let interval

    async function loadData() {
      try {
        const { data: session } =
          await getActiveSession()

        if (session) {
          setActiveSession(session)

          const { data: records } =
            await getLiveMonitoringData(session.id)

          if (records) {
            const formatted = records.map((r) => ({
              id: r.id,
              name:
                r.students?.full_name || 'Unknown',

              studentId:
                r.students?.student_code || 'N/A',

              status: r.status,

              time: new Date(
                r.detected_at
              ).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),

              confidence: r.confidence
                ? `${Math.round(
                    r.confidence * 100
                  )}%`
                : '-',
            }))

            setMonitoringData(formatted)
          }
        }

        setLoading(false)
      } catch (error) {
        console.error(
          'Monitoring load error:',
          error
        )

        setLoading(false)
      }
    }

    loadData()

    interval = setInterval(loadData, 5000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  // =====================================================
  // STATS
  // =====================================================

  const presentCount = monitoringData.filter(
    (d) => d.status === 'present'
  ).length

  const presentPercent =
    monitoringData.length > 0
      ? Math.round(
          (presentCount /
            monitoringData.length) *
            100
        )
      : 0

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ================================================= */}
        {/* LIVE STREAM */}
        {/* ================================================= */}

        <Card
          className="lg:col-span-2"
          title="Live Camera Feed"
          subtitle={
            activeSession
              ? `Session ID: ${activeSession.id}`
              : 'No active session'
          }
        >
          <div className="relative aspect-video bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
            {!streamError ? (
              <img
                src={streamUrl}
                alt="Live Stream"
                className="w-full h-full object-cover"
                onError={() =>
                  setStreamError(true)
                }
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/50">
                    <Scan
                      size={32}
                      className="text-rose-500"
                    />
                  </div>

                  <h4 className="text-white font-bold mb-2">
                    Backend Connection Lost
                  </h4>

                  <p className="text-slate-400 text-sm max-w-xs mx-auto">
                    Make sure Python backend
                    is running.
                  </p>

                  <button
                    onClick={() => {
                      setStreamError(false)
                    }}
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

            {/* STREAM TYPE */}

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
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm text-slate-500">
                  Present Students
                </p>

                <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
                  {presentCount}/
                  {monitoringData.length}
                </h3>
              </div>

              <div className="text-right">
                <p className="text-xs font-bold text-emerald-600">
                  {presentPercent}% Attendance
                </p>
              </div>
            </div>

            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-1000 ease-out"
                style={{
                  width: `${presentPercent}%`,
                }}
              />
            </div>

            <div className="space-y-4 pt-4">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                Recent Detections
              </h4>

              {monitoringData
                .filter(
                  (s) => s.status === 'present'
                )
                .slice(0, 5)
                .map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 bg-white hover:bg-slate-50 rounded-2xl border border-slate-100 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600 text-sm font-bold">
                        {student.name
                          .substring(0, 2)
                          .toUpperCase()}
                      </div>

                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {student.name}
                        </p>

                        <p className="text-[10px] text-slate-500">
                          {student.time}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                      {student.confidence}
                    </span>
                  </div>
                ))}

              {!loading &&
                monitoringData.length === 0 && (
                  <div className="text-sm text-slate-400 text-center py-10 italic border-2 border-dashed border-slate-50 rounded-2xl">
                    Waiting for detections...
                  </div>
                )}
            </div>
          </div>
        </Card>
      </div>

      {/* ================================================= */}
      {/* TABLE */}
      {/* ================================================= */}

      <Card title="Attendance Real-time List">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-slate-100">
                <th className="pb-4 px-4 font-semibold text-slate-400 text-[10px] uppercase tracking-widest">
                  Student Name
                </th>

                <th className="pb-4 px-4 font-semibold text-slate-400 text-[10px] uppercase tracking-widest">
                  Student ID
                </th>

                <th className="pb-4 px-4 font-semibold text-slate-400 text-[10px] uppercase tracking-widest">
                  Status
                </th>

                <th className="pb-4 px-4 font-semibold text-slate-400 text-[10px] uppercase tracking-widest">
                  Detected At
                </th>

                <th className="pb-4 px-4 font-semibold text-slate-400 text-[10px] uppercase tracking-widest">
                  Confidence
                </th>

                <th className="pb-4 px-4 text-right"></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {monitoringData.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="font-bold text-slate-900">
                      {item.name}
                    </div>
                  </td>

                  <td className="py-4 px-4 text-slate-500 text-sm font-medium">
                    {item.studentId}
                  </td>

                  <td className="py-4 px-4">
                    <span
                      className={cn(
                        'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter',

                        item.status ===
                          'present'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-rose-50 text-rose-600'
                      )}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="py-4 px-4 text-slate-500 text-sm font-medium">
                    {item.time}
                  </td>

                  <td className="py-4 px-4 text-emerald-600 text-sm font-bold">
                    {item.confidence}
                  </td>

                  <td className="py-4 px-4 text-right">
                    <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-all">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!loading &&
            monitoringData.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-sm font-medium">
                No monitoring records yet.
              </div>
            )}
        </div>
      </Card>
    </div>
  )
}

export default MonitoringPage