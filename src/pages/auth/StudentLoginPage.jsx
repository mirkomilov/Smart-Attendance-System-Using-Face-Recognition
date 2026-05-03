import { useNavigate } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import { motion } from 'framer-motion'
import AuthLayout from '../../layouts/AuthLayout'
import Card from '../../components/ui/Card'

function StudentLoginPage() {
  const navigate = useNavigate()

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-2xl mb-4 shadow-xl shadow-blue-200">
            <GraduationCap size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Student Login</h1>
          <p className="text-slate-500 mt-2">Access your attendance dashboard</p>
        </div>

        <Card className="p-8">
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault()
              navigate('/student/dashboard')
            }}
          >
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Student Email
              </label>
              <input
                type="email"
                placeholder="student@university.edu"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
            >
              Sign In as Student
            </button>
          </form>
        </Card>
      </motion.div>
    </AuthLayout>
  )
}

export default StudentLoginPage