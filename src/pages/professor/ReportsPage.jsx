import { useState, useMemo, useEffect } from 'react'
import { Users, CheckCircle2, XCircle, Search, Calendar as CalendarIcon } from 'lucide-react'
import Card from '../../components/ui/Card'
import { getGroupStudents, getAllAttendance, getCurrentUser, getUserProfile, getProfessorGroups } from '../../api/api'

function ReportsPage() {
  const [studentsData, setStudentsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [groups, setGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')

  useEffect(() => {
    async function loadInitialData() {
      try {
        const { data: user } = await getCurrentUser()
        if (user) {
          const { data: profile } = await getUserProfile(user.id)
          if (profile) {
            const { data: profGroups } = await getProfessorGroups(profile.id)
            if (profGroups) {
              setGroups(profGroups)
              if (profGroups.length > 0) setSelectedGroup(profGroups[0].id)
              else setLoading(false)
            } else {
              setLoading(false)
            }
          } else {
            setLoading(false)
          }
        } else {
          setLoading(false)
        }
      } catch (err) {
        console.error("Reports load error:", err)
        setLoading(false)
      }
    }
    loadInitialData()
  }, [])

  useEffect(() => {
    async function loadReports() {
      if (!selectedGroup) {
        if (groups.length === 0) setLoading(false)
        return
      }
      
      setLoading(true)
      try {
        const { data: students } = await getGroupStudents(selectedGroup)
        const { data: attendance } = await getAllAttendance()
        
        if (students && attendance) {
          const formattedStudents = students.map(st => {
            const studentAttendance = attendance.filter(a => a.student_id === st.id)
            const attendanceMap = {}
            studentAttendance.forEach(a => {
              if (a.attendance_sessions?.date) {
                attendanceMap[a.attendance_sessions.date] = a.status
              }
            })
            return {
              id: st.id,
              name: st.full_name,
              studentId: st.student_code,
              group: st.groups?.name || '',
              attendance: attendanceMap
            }
          })
          setStudentsData(formattedStudents)
        }
      } catch (err) {
        console.error("Reports data error:", err)
      } finally {
        setLoading(false)
      }
    }
    loadReports()
  }, [selectedGroup, groups.length])

  const filteredStudents = studentsData.filter(student => 
    student.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    student.studentId?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const ACADEMIC_MONTHS = useMemo(() => [
    { label: 'September', value: '09' },
    { label: 'October', value: '10' },
    { label: 'November', value: '11' },
    { label: 'December', value: '12' },
    { label: 'January', value: '01' },
    { label: 'February', value: '02' },
    { label: 'March', value: '03' },
    { label: 'April', value: '04' },
    { label: 'May', value: '05' },
    { label: 'June', value: '06' }
  ], [])

  const allDates = useMemo(() => {
    if (!studentsData || studentsData.length === 0) return []
    const datesSet = new Set()
    
    studentsData.forEach(student => {
      if (student.attendance) {
        Object.keys(student.attendance).forEach(date => datesSet.add(date))
      }
    })
    
    return Array.from(datesSet).sort((a, b) => new Date(a) - new Date(b))
  }, [studentsData])

  const displayDates = useMemo(() => {
    if (!selectedMonth) return allDates
    return allDates.filter(date => {
      // dates are likely YYYY-MM-DD
      const monthParts = date.split('-')
      return monthParts.length === 3 && monthParts[1] === selectedMonth
    })
  }, [allDates, selectedMonth])

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading reports...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-900">Attendance Reports</h2>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
          <div className="w-full md:w-64">
            <label className="block text-sm font-bold text-slate-700 mb-2">Select Group</label>
            <div className="relative">
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-2.5 pr-8 transition-all font-medium outline-none cursor-pointer"
              >
                {groups.map(group => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <Users size={16} />
              </div>
            </div>
          </div>

          <div className="w-full md:w-48">
            <label className="block text-sm font-bold text-slate-700 mb-2">Select Month</label>
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-2.5 pr-8 transition-all font-medium outline-none cursor-pointer"
              >
                <option value="">All Months</option>
                {ACADEMIC_MONTHS.map(month => (
                  <option key={month.label} value={month.value}>{month.label}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <CalendarIcon size={16} />
              </div>
            </div>
          </div>

          <div className="w-full md:flex-1 max-w-md">
            <label className="block text-sm font-bold text-slate-700 mb-2">Search Student</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100">
          {filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500">
              <Users size={48} className="text-slate-200 mb-4" />
              <h3 className="text-lg font-bold text-slate-700 mb-1">No Students Found</h3>
              <p className="text-sm">Try adjusting your search query or selecting a different group.</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-4 font-semibold">Student Name</th>
                  <th className="px-4 py-4 font-semibold">ID</th>
                  <th className="px-4 py-4 font-semibold text-center text-rose-600">Total Absences</th>
                  {displayDates.map(date => (
                    <th key={date} className="px-4 py-4 font-semibold text-center">{date}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => {
                  const totalAbsences = Object.values(student.attendance || {}).filter(status => status === 'absent').length;
                  
                  return (
                    <tr key={student.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {student.name}
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-xs">
                        {student.studentId}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 font-bold text-xs">
                          {totalAbsences}
                        </span>
                      </td>
                      {displayDates.map(date => {
                        const status = student.attendance?.[date]
                        return (
                          <td key={date} className="px-4 py-3 text-center">
                            {(status === 'present' || status === 'late') && (
                              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 mx-auto" title="Present">
                                <CheckCircle2 size={16} />
                              </div>
                            )}
                            {status === 'absent' && (
                              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-rose-50 text-rose-600 mx-auto" title="Absent">
                                <XCircle size={16} />
                              </div>
                            )}
                            {!status && (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  )
}

export default ReportsPage