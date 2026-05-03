import { Link } from 'react-router-dom'

function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="max-w-3xl text-center">
        <h1 className="text-5xl font-bold text-slate-900 leading-tight">
          Smart Attendance System
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Automated student attendance tracking via networked camera systems and face
          recognition.
        </p>

        <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
          <Link
            to="/auth/select-role"
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  )
}

export default HomePage