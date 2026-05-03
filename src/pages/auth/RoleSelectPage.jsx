import { useNavigate } from 'react-router-dom'
import { GraduationCap, UserCog, ChevronRight, Scan } from 'lucide-react'
import { motion } from 'framer-motion'
import AuthLayout from '../../layouts/AuthLayout'
import Card from '../../components/ui/Card'

function RoleSelectPage() {
  const navigate = useNavigate()

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-2xl mb-4 shadow-xl shadow-blue-200">
            <Scan size={32} className="text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            Smart Attendance System
          </h1>
          <p className="text-slate-500 mt-3 text-base md:text-lg">
            Continue as a student or professor
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-8 hover:shadow-lg transition-all border-2 hover:border-blue-200">
            <div className="flex flex-col h-full">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                <GraduationCap size={30} />
              </div>

              <h2 className="text-2xl font-bold text-slate-900">Student</h2>
              <p className="text-slate-500 mt-3 leading-7">
                Upload face data, log in, and track your attendance.
              </p>

              <div className="mt-auto pt-8 space-y-3">
                <button
                  onClick={() => navigate('/student/login')}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  Student Login <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </Card>

          <Card className="p-8 hover:shadow-lg transition-all border-2 hover:border-blue-200">
            <div className="flex flex-col h-full">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center mb-6">
                <UserCog size={30} />
              </div>

              <h2 className="text-2xl font-bold text-slate-900">Professor</h2>
              <p className="text-slate-500 mt-3 leading-7">
                Log in to manage sessions, monitor attendance, and view reports.
              </p>

              <div className="mt-auto pt-8">
                <button
                  onClick={() => navigate('/professor/login')}
                  className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                  Professor Login <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>
    </AuthLayout>
  )
}

export default RoleSelectPage