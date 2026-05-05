import { useState, useEffect } from 'react'
import { MoreVertical, Scan } from 'lucide-react'
import Card from '../../components/ui/Card'
import { cn } from '../../lib/cn'
import { getActiveSession, getLiveMonitoringData } from '../../api/api'

function MonitoringPage() {
  const [monitoringData, setMonitoringData] = useState([])
  const [activeSession, setActiveSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const { data: session } = await getActiveSession()
      if (session) {
        setActiveSession(session)
        const { data: records } = await getLiveMonitoringData(session.id)
        if (records) {
          // Map to monitoring data format
          const formatted = records.map(r => ({
            id: r.id,
            name: r.students?.full_name || 'Unknown',
            studentId: r.students?.student_code || 'N/A',
            status: r.status,
            time: new Date(r.detected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            confidence: r.confidence ? `${Math.round(r.confidence * 100)}%` : '-'
          }))
          setMonitoringData(formatted)
        }
      }
      setLoading(false)
    }

    loadData()
    // In a real app, we'd setup a Supabase real-time subscription here
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [])

  const presentCount = monitoringData.filter(d => d.status === 'present').length
  const totalCount = monitoringData.length || 1 // Avoid div by 0
  const presentPercent = monitoringData.length > 0 ? Math.round((presentCount / monitoringData.length) * 100) : 0

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Connecting to live feed...</div>
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card
          className="lg:col-span-2"
          title="Live Camera Feed"
          subtitle={activeSession ? `Session ID: ${activeSession.id}` : "No active session"}
        >
          <div className="relative aspect-video bg-slate-900 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Scan size={64} className="text-blue-500 mx-auto mb-4 animate-pulse" />
                <p className="text-slate-400 font-medium">
                  {activeSession ? "Scanning for faces..." : "Waiting for session to start..."}
                </p>
              </div>
            </div>

            <div className="absolute bottom-6 left-6 flex items-center gap-3">
              <div className={cn("w-3 h-3 rounded-full animate-ping", activeSession ? "bg-rose-500" : "bg-slate-500")} />
              <span className="text-white text-sm font-bold uppercase tracking-wider">
                Live Monitoring
              </span>
            </div>
          </div>
        </Card>

        <Card title="Detection Stats">
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm text-slate-500">Present</p>
                <h3 className="text-3xl font-bold text-slate-900">{presentCount}/{monitoringData.length}</h3>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-emerald-600">{presentPercent}% Detected</p>
              </div>
            </div>

            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full transition-all" style={{ width: `${presentPercent}%` }} />
            </div>

            <div className="space-y-4 pt-4">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Recent Detections
              </h4>

              {monitoringData.filter((s) => s.status === 'present').slice(0, 5).map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                      {student.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{student.name}</p>
                      <p className="text-[10px] text-slate-500">{student.time}</p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-emerald-600">
                    {student.confidence}
                  </span>
                </div>
              ))}
              {monitoringData.length === 0 && (
                <div className="text-sm text-slate-500 text-center py-4">No detections yet.</div>
              )}
            </div>
          </div>
        </Card>
      </div>

      <Card title="Attendance Real-time List">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-slate-100">
                <th className="pb-4 font-semibold text-slate-600 text-sm">Student Name</th>
                <th className="pb-4 font-semibold text-slate-600 text-sm">ID</th>
                <th className="pb-4 font-semibold text-slate-600 text-sm">Status</th>
                <th className="pb-4 font-semibold text-slate-600 text-sm">Time Detected</th>
                <th className="pb-4 font-semibold text-slate-600 text-sm">Confidence</th>
                <th className="pb-4 font-semibold text-slate-600 text-sm">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {monitoringData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 font-medium text-slate-900">{item.name}</td>
                  <td className="py-4 text-slate-500 text-sm">{item.studentId}</td>
                  <td className="py-4">
                    <span
                      className={cn(
                        'px-3 py-1 rounded-full text-xs font-bold capitalize',
                        item.status === 'present'
                          ? 'bg-emerald-50 text-emerald-600'
                          : item.status === 'pending'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-rose-50 text-rose-600'
                      )}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 text-slate-500 text-sm">{item.time}</td>
                  <td className="py-4 text-slate-500 text-sm">{item.confidence}</td>
                  <td className="py-4">
                    <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {monitoringData.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">
                    No records to display.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export default MonitoringPage