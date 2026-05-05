import { useState, useEffect } from 'react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns'
import { Calendar as CalendarIcon, CheckCircle2, XCircle, BarChart3, Clock, Users, MapPin, Clock3, ChevronLeft, ChevronRight } from 'lucide-react'
import Card from '../../components/ui/Card'
import StatCard from '../../components/ui/StatCard'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { cn } from '../../lib/cn'
import { getCurrentUser, getUserProfile, getStudentSchedule, getAttendanceByStudent } from '../../api/api'

function StudentDashboardPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [schedules, setSchedules] = useState([])
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const { data: user } = await getCurrentUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data: profile } = await getUserProfile(user.id)
      const studentId = profile?.id

      if (studentId) {
        const { data: schedData } = await getStudentSchedule(studentId)
        const { data: attData } = await getAttendanceByStudent(studentId)
        if (schedData) setSchedules(schedData)
        if (attData) setAttendanceRecords(attData)
      }
      setLoading(false)
    }
    loadData()
  }, [])

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

  const getClassesForDate = (date) => {
    const dayName = format(date, 'EEEE')
    const dateStr = format(date, 'yyyy-MM-dd')
    const now = new Date()
    const todayStr = format(now, 'yyyy-MM-dd')

    // Find all schedules matching this day of week
    const dailySchedules = schedules.filter(s => s.day_of_week === dayName)

    return dailySchedules.map((sched) => {
      // check if there's an attendance record for this schedule on this date
      const record = attendanceRecords.find(r => 
        r.attendance_sessions && 
        r.attendance_sessions.date === dateStr &&
        r.attendance_sessions.schedule_id === sched.id
      )

      let status = 'upcoming'
      if (record) {
        status = record.status // 'present', 'absent', 'late'
      } else if (dateStr < todayStr) {
        status = 'absent' // past without record implies absent
      }

      return {
        id: sched.id,
        course: sched.courses?.name || 'Unknown Course',
        time: `${sched.start_time?.slice(0,5)} - ${sched.end_time?.slice(0,5)}`,
        room: sched.rooms?.name || 'TBA',
        professor: sched.professors?.full_name || 'TBA',
        status,
        uniqueId: `${dateStr}-${sched.id}`
      }
    })
  }

  const selectedDateClasses = getClassesForDate(selectedDate)

  // Calculate overall stats
  let totalClasses = 0
  let presentClasses = 0
  let absentClasses = 0
  let lateClasses = 0

  attendanceRecords.forEach(r => {
    totalClasses++
    if (r.status === 'present') presentClasses++
    else if (r.status === 'absent') absentClasses++
    else if (r.status === 'late') lateClasses++
  })

  // Mocking total classes somewhat if empty to avoid 0/0
  const totalExpected = schedules.length * 4 // roughly 4 weeks a month
  const attendancePercent = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0

  const pieData = [
    { name: 'Present', value: presentClasses || 1, color: '#0ea5e9' }, // || 1 to show empty chart
    { name: 'Absent', value: absentClasses, color: '#ef4444' },
    { name: 'Late', value: lateClasses, color: '#f59e0b' },
  ]
  const renderPieData = totalClasses > 0 ? pieData : [{ name: 'No Data', value: 1, color: '#e2e8f0' }]

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading your dashboard...</div>
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Classes" value={totalClasses.toString()} icon={CalendarIcon} color="bg-blue-600" />
        <StatCard label="Present" value={presentClasses.toString()} icon={CheckCircle2} trend="" color="bg-emerald-500" />
        <StatCard label="Absent" value={absentClasses.toString()} icon={XCircle} trend="" color="bg-rose-500" />
        <StatCard label="Attendance %" value={`${attendancePercent}%`} icon={BarChart3} color="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2" title="Attendance Calendar" subtitle="View your monthly attendance history">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 capitalize">{format(currentDate, 'MMMM yyyy')}</h3>
                <div className="flex gap-2">
                  <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <div key={day} className="text-center text-xs font-semibold text-slate-500 py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, idx) => {
                  const dayClasses = getClassesForDate(day);
                  const isSelected = isSameDay(day, selectedDate);
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        "min-h-14 p-1.5 rounded-xl cursor-pointer transition-all border",
                        !isCurrentMonth ? "opacity-30 border-transparent hover:bg-slate-50" : 
                        isSelected ? "border-blue-500 bg-blue-50 shadow-sm" : "border-slate-100 hover:border-slate-300 hover:bg-slate-50",
                        isToday(day) && !isSelected && "bg-slate-100 font-bold"
                      )}
                    >
                      <div className={cn("text-right text-sm mb-1 pr-1 font-medium", isSelected ? "text-blue-700" : "text-slate-700")}>
                        {format(day, 'd')}
                      </div>
                      <div className="flex flex-wrap gap-1 justify-end pr-1">
                        {dayClasses.map((cls) => (
                          <div 
                            key={cls.uniqueId} 
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              cls.status === 'present' ? "bg-emerald-500" :
                              cls.status === 'absent' ? "bg-rose-500" :
                              cls.status === 'late' ? "bg-amber-500" : "bg-slate-300"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="w-full md:w-[320px] border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-6 flex flex-col">
              <div className="mb-4">
                <h4 className="font-bold text-slate-800">{format(selectedDate, 'EEEE, MMMM d')}</h4>
                <p className="text-sm text-slate-500">Classes for this day</p>
              </div>
              
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {selectedDateClasses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-center text-slate-500">
                    <CalendarIcon size={32} className="text-slate-300 mb-2" />
                    <p className="text-sm">No classes scheduled</p>
                  </div>
                ) : (
                  selectedDateClasses.map((cls) => (
                    <div key={cls.uniqueId} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col gap-2">
                      <div className="flex items-start justify-between">
                        <h5 className="font-bold text-slate-900 text-sm leading-tight">{cls.course}</h5>
                        {cls.status === 'present' && <CheckCircle2 size={16} className="text-emerald-500 shrink-0 ml-2" />}
                        {cls.status === 'absent' && <XCircle size={16} className="text-rose-500 shrink-0 ml-2" />}
                        {cls.status === 'upcoming' && <Clock size={16} className="text-slate-400 shrink-0 ml-2" />}
                      </div>
                      <div className="text-xs text-slate-500 space-y-1.5 mt-1">
                        <div className="flex items-center gap-1.5">
                          <Clock3 size={12} className="text-blue-500" />
                          <span>{cls.time}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin size={12} className="text-rose-500" />
                          <span>{cls.room}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users size={12} className="text-amber-500" />
                          <span>{cls.professor}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-8">
          <Card title="Attendance Overview">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={renderPieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {renderPieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3 mt-4">
              {totalClasses > 0 ? pieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">{Math.round((item.value / totalClasses) * 100)}%</span>
                </div>
              )) : (
                <div className="text-sm text-center text-slate-500">No attendance data yet</div>
              )}
            </div>
          </Card>

          {schedules.length > 0 && (
            <Card className="bg-blue-600 text-white border-none shadow-blue-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Clock size={20} />
                </div>
                <h4 className="font-bold">Next Class</h4>
              </div>
              <h3 className="text-xl font-bold mb-4">{schedules[0]?.courses?.name || 'TBA'}</h3>
              <div className="flex items-center gap-2 text-sm text-blue-100">
                <Users size={16} />
                <span>Room {schedules[0]?.rooms?.name || 'TBA'} • {schedules[0]?.professors?.full_name || 'TBA'}</span>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default StudentDashboardPage