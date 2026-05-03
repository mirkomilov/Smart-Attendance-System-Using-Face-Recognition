import { MoreVertical, Scan } from 'lucide-react'
import Card from '../../components/ui/Card'
import { MONITORING_DATA } from '../../data/mockData'
import { cn } from '../../lib/cn'

function MonitoringPage() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card
          className="lg:col-span-2"
          title="Live Camera Feed"
          subtitle="Classroom L-201 • Machine Learning"
        >
          <div className="relative aspect-video bg-slate-900 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Scan size={64} className="text-blue-500 mx-auto mb-4 animate-pulse" />
                <p className="text-slate-400 font-medium">Scanning for faces...</p>
              </div>
            </div>

            <div className="absolute top-1/4 left-1/4 w-32 h-32 border-2 border-emerald-500 rounded-lg">
              <span className="absolute -top-8 left-0 bg-emerald-500 text-white text-[10px] px-2 py-1 rounded font-bold">
                Alex J. (98%)
              </span>
            </div>

            <div className="absolute top-1/3 right-1/4 w-28 h-28 border-2 border-emerald-500 rounded-lg">
              <span className="absolute -top-8 left-0 bg-emerald-500 text-white text-[10px] px-2 py-1 rounded font-bold">
                Sarah W. (95%)
              </span>
            </div>

            <div className="absolute bottom-6 left-6 flex items-center gap-3">
              <div className="w-3 h-3 bg-rose-500 rounded-full animate-ping" />
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
                <h3 className="text-3xl font-bold text-slate-900">32/45</h3>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-emerald-600">71% Detected</p>
              </div>
            </div>

            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-[71%]" />
            </div>

            <div className="space-y-4 pt-4">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Recent Detections
              </h4>

              {MONITORING_DATA.filter((s) => s.status === 'Present').map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                      {student.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
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
              {MONITORING_DATA.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 font-medium text-slate-900">{item.name}</td>
                  <td className="py-4 text-slate-500 text-sm">{item.studentId}</td>
                  <td className="py-4">
                    <span
                      className={cn(
                        'px-3 py-1 rounded-full text-xs font-bold',
                        item.status === 'Present'
                          ? 'bg-emerald-50 text-emerald-600'
                          : item.status === 'Pending'
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
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export default MonitoringPage