import { useState, useEffect } from 'react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns'
import { Calendar as CalendarIcon, Clock3, MapPin, Users, ChevronLeft, ChevronRight } from 'lucide-react'
import Card from '../../components/ui/Card'
import { cn } from '../../lib/cn'
import { getCurrentUser, getUserProfile, getProfessorSchedule } from '../../api/api'

function ProfessorDashboardPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)



  useEffect(() => {
    async function loadData() {
      try {
        const { data: user } = await getCurrentUser()
        if (user) {
          const { data: profile } = await getUserProfile(user.id)
          if (profile?.id) {
            const { data: schedData } = await getProfessorSchedule(profile.id)
            if (schedData) {
              setSchedules(schedData)
            }
          }
        }
      } catch (error) {
        console.error("Dashboard data load error:", error)
      } finally {
        setLoading(false)
      }
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

  const now = new Date();
  const semesterStart = now.getMonth() < 7 ? new Date(now.getFullYear(), 2, 1) : new Date(now.getFullYear(), 8, 1);
  const semesterEnd = now.getMonth() < 7 ? new Date(now.getFullYear(), 4, 31) : new Date(now.getFullYear(), 11, 31);

  const getClassesForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const semesterStartStr = format(semesterStart, 'yyyy-MM-dd')
    const semesterEndStr = format(semesterEnd, 'yyyy-MM-dd')
    
    if (dateStr < semesterStartStr || dateStr > semesterEndStr) {
      return []
    }

    // getDay() returns 0 for Sunday, 1 for Monday, etc.
    // Convert to 1 for Monday, ..., 7 for Sunday (ISO)
    const dayNum = date.getDay() === 0 ? 7 : date.getDay()
    
    // Find all schedules matching this day of week (numeric)
    const dailySchedules = schedules.filter(s => Number(s.day_of_week) === dayNum)

    return dailySchedules.map((cls) => {
      return { 
        id: cls.id,
        course: cls.courses?.name || 'Unknown',
        type: cls.type || 'Lecture',
        time: `${cls.start_time?.slice(0,5)} - ${cls.end_time?.slice(0,5)}`,
        group: cls.groups?.name || 'Unknown',
        room: cls.rooms?.name || 'TBA',
        status: 'scheduled', 
        uniqueId: `${dateStr}-${cls.id}` 
      }
    })
  }

  const selectedDateClasses = getClassesForDate(selectedDate)

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading your schedule...</div>
  }

  return (
    <div className="space-y-8">


      <Card title="Teaching Schedule" subtitle="View your classes, groups and locations">
        <div className="flex flex-col lg:flex-row gap-6">
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
                      "min-h-16 p-1.5 rounded-xl cursor-pointer transition-all border",
                      !isCurrentMonth ? "opacity-30 border-transparent hover:bg-slate-50" : 
                      isSelected ? "border-blue-500 bg-blue-50 shadow-sm" : "border-slate-100 hover:border-slate-300 hover:bg-slate-50",
                      isToday(day) && !isSelected && "bg-slate-100 font-bold"
                    )}
                  >
                    <div className={cn("text-right text-sm mb-1 pr-1 font-medium", isSelected ? "text-blue-700" : "text-slate-700")}>
                      {format(day, 'd')}
                    </div>
                    <div className="flex flex-wrap gap-1 justify-end pr-1 mt-1">
                      {dayClasses.map((cls) => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const todayStr = format(now, 'yyyy-MM-dd');
                        const isUpcoming = dateStr > todayStr;
                        return (
                          <div 
                            key={cls.uniqueId} 
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              isUpcoming ? "bg-slate-300" : "bg-blue-500"
                            )}
                          />
                        )
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="w-full lg:w-[380px] border-t lg:border-t-0 lg:border-l border-slate-100 pt-6 lg:pt-0 lg:pl-6 flex flex-col">
            <div className="mb-4">
              <h4 className="font-bold text-slate-800">{format(selectedDate, 'EEEE, MMMM d')}</h4>
              <p className="text-sm text-slate-500">Scheduled classes</p>
            </div>
            
            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              {selectedDateClasses.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-center text-slate-500">
                  <CalendarIcon size={32} className="text-slate-300 mb-2" />
                  <p className="text-sm">No classes scheduled</p>
                </div>
              ) : (
                selectedDateClasses.map((cls) => (
                  <div key={cls.uniqueId} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col gap-3">
                    <div className="flex items-start justify-between">
                      <h5 className="font-bold text-slate-900 text-sm leading-tight">{cls.course}</h5>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-blue-100 text-blue-700 shrink-0 ml-2">
                        {cls.type}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 space-y-2 mt-1">
                      <div className="flex items-center gap-2">
                        <Clock3 size={14} className="text-blue-500" />
                        <span className="font-medium text-slate-700">{cls.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-amber-500" />
                        <span className="font-medium text-slate-700">Group {cls.group}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-rose-500" />
                        <span className="font-medium text-slate-700">Room {cls.room}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ProfessorDashboardPage