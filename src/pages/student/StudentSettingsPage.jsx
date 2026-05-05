import { useState, useEffect } from 'react'
import { GraduationCap, BookOpen, Clock3, MapPin, User } from 'lucide-react'
import Card from '../../components/ui/Card'
import { getCurrentUser, getUserProfile, getEnrolledCourses, getAttendanceByStudent } from '../../api/api'

function StudentSettingsPage() {
  const [profile, setProfile] = useState(null)
  const [user, setUser] = useState(null)
  const [courses, setCourses] = useState([])
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const { data: authUser } = await getCurrentUser()
      if (authUser) {
        setUser(authUser)
        const { data: userProfile } = await getUserProfile(authUser.id)
        if (userProfile) {
          setProfile(userProfile)

          // group_id bo'yicha darslar
          const { data: enrolled } = await getEnrolledCourses(userProfile.group_id)
          if (enrolled) setCourses(enrolled)

          // davomat ma'lumotlari
          const { data: att } = await getAttendanceByStudent(userProfile.id)
          if (att) setAttendanceRecords(att)
        }
      }
      setLoading(false)
    }
    loadData()
  }, [])

  // Har bir kurs uchun davomat foizini hisoblash
  function getCourseStats(courseId) {
    const related = attendanceRecords.filter(
      r => r.attendance_sessions?.schedules?.courses?.id === courseId
    )
    const total = related.length
    const present = related.filter(r => r.status === 'present' || r.status === 'late').length
    return { total, present }
  }

  if (loading) {
    return <div className="max-w-4xl mx-auto p-8 text-center text-slate-500">Loading profile...</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card
        title="Student Profile"
        subtitle="Your personal information and account details"
      >
        <div className="flex flex-col md:flex-row gap-10">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-4 shrink-0">
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white border-4 border-white shadow-xl">
              {profile?.full_name ? (
                <span className="text-4xl font-bold">
                  {profile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </span>
              ) : (
                <GraduationCap size={42} />
              )}
            </div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {profile?.role_id ? 'Student' : 'Student'}
            </span>
          </div>

          {/* Fields */}
          <div className="flex-1 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                <div className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 text-slate-800 font-semibold">
                  {profile?.full_name || 'N/A'}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Student Code</label>
                <div className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 text-slate-800 font-semibold font-mono">
                  {profile?.student_code || 'N/A'}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Faculty</label>
                <div className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 text-slate-800 font-semibold">
                  {profile?.faculty?.name || 'N/A'}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Group</label>
                <div className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 text-slate-800 font-semibold">
                  {profile?.groups?.name || 'N/A'}
                </div>
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                <div className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 text-slate-800 font-semibold">
                  {profile?.email || user?.email || 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Subjects */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <BookOpen size={20} className="text-blue-600" />
          <h3 className="text-lg font-bold text-slate-900">Enrolled Subjects</h3>
          {courses.length > 0 && (
            <span className="ml-auto px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
              {courses.length} subjects
            </span>
          )}
        </div>

        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {courses.map((subject) => {
              const stats = getCourseStats(subject.courses?.id)
              const percent = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0
              const barColor = percent >= 75 ? 'bg-emerald-500' : percent >= 50 ? 'bg-amber-500' : 'bg-rose-500'

              return (
                <div key={subject.id} className="p-6 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base leading-tight mb-1">
                        {subject.courses?.name || 'Unknown Course'}
                      </h4>
                      {subject.type && (
                        <span className="inline-block px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                          {subject.type}
                        </span>
                      )}
                    </div>
                    <span className="text-lg font-extrabold text-slate-800">{percent}%</span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-500 mb-4">
                    {subject.professors?.full_name && (
                      <div className="flex items-center gap-2">
                        <User size={12} className="text-blue-400 shrink-0" />
                        <span>{subject.professors.full_name}</span>
                      </div>
                    )}
                    {subject.rooms?.name && (
                      <div className="flex items-center gap-2">
                        <MapPin size={12} className="text-rose-400 shrink-0" />
                        <span>Room {subject.rooms.name}</span>
                      </div>
                    )}
                    {subject.day_of_week && subject.start_time && (
                      <div className="flex items-center gap-2">
                        <Clock3 size={12} className="text-emerald-500 shrink-0" />
                        <span>
                          {subject.day_of_week} • {subject.start_time?.slice(0, 5)} – {subject.end_time?.slice(0, 5)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${barColor}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="text-xs font-medium text-slate-500 mt-2">
                    {stats.present}/{stats.total} lessons attended
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-10 rounded-2xl border border-slate-100 bg-white text-center">
            <BookOpen size={40} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No subjects found for your group.</p>
            <p className="text-slate-400 text-sm mt-1">
              {profile?.groups?.name
                ? `Group: ${profile.groups.name}`
                : 'Your group has not been assigned yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentSettingsPage