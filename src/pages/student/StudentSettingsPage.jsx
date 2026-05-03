import { GraduationCap } from 'lucide-react'
import Card from '../../components/ui/Card'
import { SUBJECTS_DATA } from '../../data/mockData'

function StudentSettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card
        title="Student Profile"
        subtitle="Update your personal information and account settings"
      >
        <div className="flex flex-col md:flex-row gap-10">
          <div className="flex flex-col items-center gap-4 shrink-0">
            <div className="w-32 h-32 rounded-3xl bg-blue-100 flex items-center justify-center text-blue-600 border-4 border-white shadow-xl">
              <GraduationCap size={42} />
            </div>
            <button className="text-sm font-semibold text-blue-600 hover:underline">
              Change Photo
            </button>
          </div>

          <div className="flex-1 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-3">
                <label className="text-sm font-semibold text-slate-700">Full Name</label>
                <div className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 text-slate-700 font-medium">
                  John Doe
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-sm font-semibold text-slate-700">Student ID</label>
                <div className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 text-slate-700 font-medium">
                  S12345
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-sm font-semibold text-slate-700">Faculty</label>
                <div className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 text-slate-700 font-medium">
                  Computer Science
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-sm font-semibold text-slate-700">Group</label>
                <div className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 text-slate-700 font-medium">
                  CS-2024
                </div>
              </div>

              <div className="flex flex-col gap-3 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Email Address</label>
                <div className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 text-slate-700 font-medium">
                  student@university.edu
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SUBJECTS_DATA.map((subject) => (
          <div key={subject.id} className="p-6 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
            <h4 className="font-bold text-slate-900 mb-1">{subject.course}</h4>
            <p className="text-sm text-slate-500 mb-6">{subject.professor}</p>
            
            <div className="w-full h-2 bg-slate-100 rounded-full mb-3 overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full" 
                style={{ width: `${(subject.attended / subject.total) * 100}%` }}
              />
            </div>
            <div className="text-sm font-medium text-slate-600">
              {subject.attended}/{subject.total} lessons
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default StudentSettingsPage