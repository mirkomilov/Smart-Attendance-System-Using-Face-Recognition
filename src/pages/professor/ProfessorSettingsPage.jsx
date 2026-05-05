import { useState, useEffect } from 'react'
import { BookOpen, Mail, User } from 'lucide-react'
import Card from '../../components/ui/Card'
import { getCurrentUser, getUserProfile, getProfessorSubjects } from '../../api/api'

function ProfessorSettingsPage() {
  const [profile, setProfile] = useState(null)
  const [user, setUser] = useState(null)
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const { data: authUser } = await getCurrentUser()
      if (authUser) {
        setUser(authUser)
        const { data: profProfile } = await getUserProfile(authUser.id)
        if (profProfile) {
          setProfile(profProfile)
          const { data: profSubjects } = await getProfessorSubjects(profProfile.id)
          if (profSubjects) setSubjects(profSubjects)
        }
      }
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) {
    return <div className="max-w-4xl mx-auto p-8 text-center text-slate-500">Loading profile...</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card
        title="Professor Profile"
        subtitle="Your personal information and teaching subjects"
      >
        <div className="flex flex-col md:flex-row gap-10">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-4 shrink-0">
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white border-4 border-white shadow-xl">
              {profile?.full_name ? (
                <span className="text-4xl font-bold">
                  {profile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </span>
              ) : (
                <User size={42} />
              )}
            </div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Professor
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
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                <div className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 text-slate-800 font-semibold">
                  {profile?.email || user?.email || 'N/A'}
                </div>
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subjects Taught</label>
                <div className="flex flex-wrap gap-3">
                  {subjects.length > 0 ? (
                    subjects.map((subject, index) => (
                      <div key={index} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-100 bg-white text-slate-700 font-medium shadow-sm">
                        <BookOpen size={16} className="text-blue-500" />
                        {subject.name}
                      </div>
                    ))
                  ) : (
                    <span className="text-sm text-slate-400 italic">No subjects assigned yet</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ProfessorSettingsPage