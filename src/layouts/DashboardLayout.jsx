import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Menu,
  Plus,
  Scan,
} from 'lucide-react'
import SidebarItem from '../components/ui/SidebarItem'
import { cn } from '../lib/cn'

function DashboardLayout({ role = 'student' }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  const studentNav = [
    { path: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/student/settings', label: 'Profile', icon: Settings },
  ]

  const professorNav = [
    { path: '/professor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/professor/monitoring', label: 'Monitoring', icon: Scan },
    { path: '/professor/reports', label: 'Reports', icon: BarChart3 },
    { path: '/professor/settings', label: 'Settings', icon: Settings },
  ]

  const navItems = role === 'professor' ? professorNav : studentNav

  const matchedItem =
    navItems.find((item) => location.pathname === item.path) ||
    navItems.find((item) => location.pathname.startsWith(item.path))

  const pageTitle = matchedItem?.label || 'Dashboard'

  const handleLogout = () => {
    navigate('/auth/select-role')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 bg-white border-r border-slate-100 transition-all duration-300 z-50',
          sidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        <div className="h-full flex flex-col p-4">
          <div className="flex items-center gap-3 px-2 mb-10">
            <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200">
              <Scan size={24} />
            </div>
            {sidebarOpen && <span className="text-xl font-bold text-slate-900">FaceAttend</span>}
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <SidebarItem
                key={item.path}
                icon={item.icon}
                label={sidebarOpen ? item.label : ''}
                active={location.pathname === item.path}
                onClick={() => navigate(item.path)}
              />
            ))}
          </nav>

          <div className="pt-4 border-t border-slate-100">
            <SidebarItem
              icon={LogOut}
              label={sidebarOpen ? 'Logout' : ''}
              onClick={handleLogout}
            />
          </div>
        </div>
      </aside>

      <main className={cn('flex-1 transition-all duration-300', sidebarOpen ? 'ml-64' : 'ml-20')}>
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-xl font-semibold text-slate-900">{pageTitle}</h2>
          </div>

          <div className="flex items-center gap-6">


            <button className="relative p-2 hover:bg-slate-100 rounded-lg text-slate-500">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>

            <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900">
                  {role === 'professor' ? 'Prof. Robert Fox' : 'John Doe'}
                </p>
                <p className="text-xs text-slate-500">
                  {role === 'professor' ? 'Computer Science' : 'CS-2024'}
                </p>
              </div>

              <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-white shadow-sm flex items-center justify-center text-blue-600 font-bold">
                {role === 'professor' ? 'RF' : 'JD'}
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default DashboardLayout