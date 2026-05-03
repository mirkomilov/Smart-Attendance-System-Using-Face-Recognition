import { useNavigate } from 'react-router-dom'
import { UserCog } from 'lucide-react'
import { motion } from 'framer-motion'
import AuthLayout from '../../layouts/AuthLayout'
import Card from '../../components/ui/Card'

function ProfessorLoginPage() {
  const navigate = useNavigate()

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-slate-900 rounded-2xl mb-4 shadow-xl shadow-slate-200">
            <UserCog size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Professor Login</h1>
          <p className="text-slate-500 mt-2">Manage attendance and classroom sessions</p>
        </div>

        <Card className="p-8">
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault()
              navigate('/professor/dashboard')
            }}
          >
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Professor Email
              </label>
              <input
                type="email"
                placeholder="professor@university.edu"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-500 outline-none transition-all"
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
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-500 outline-none transition-all"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all"
            >
              Sign In as Professor
            </button>
          </form>
        </Card>
      </motion.div>
    </AuthLayout>
  )
}

export default ProfessorLoginPage