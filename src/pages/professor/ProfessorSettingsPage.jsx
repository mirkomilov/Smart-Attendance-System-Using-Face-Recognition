import { BookOpen } from 'lucide-react'
import Card from '../../components/ui/Card'

function ProfessorSettingsPage() {
  const subjects = [
    'Machine Learning',
    'Artificial Intelligence',
    'Data Structures'
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card
        title="Professor Profile"
        subtitle="View your personal information and teaching subjects"
      >
        <div className="flex flex-col md:flex-row gap-10">
          <div className="flex flex-col items-center gap-4 shrink-0">
            <div className="w-32 h-32 rounded-3xl bg-blue-100 flex items-center justify-center text-blue-600 text-4xl font-bold border-4 border-white shadow-xl">
              RF
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
                  Prof. Robert Fox
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-sm font-semibold text-slate-700">Email Address</label>
                <div className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 text-slate-700 font-medium">
                  robert.fox@uni.edu
                </div>
              </div>

              <div className="flex flex-col gap-3 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Subjects Taught</label>
                <div className="flex flex-wrap gap-3">
                  {subjects.map((subject, index) => (
                    <div key={index} className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 text-slate-700 font-medium">
                      <BookOpen size={16} className="text-blue-500" />
                      {subject}
                    </div>
                  ))}
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