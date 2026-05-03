import { createBrowserRouter, Navigate } from 'react-router-dom'
import HomePage from '../pages/common/HomePage'
import RoleSelectPage from '../pages/auth/RoleSelectPage'
import StudentLoginPage from '../pages/auth/StudentLoginPage'
import ProfessorLoginPage from '../pages/auth/ProfessorLoginPage'
import FaceCapturePage from '../pages/auth/FaceCapturePage'
import StudentDashboardPage from '../pages/student/StudentDashboardPage'
import StudentSettingsPage from '../pages/student/StudentSettingsPage'
import ProfessorDashboardPage from '../pages/professor/ProfessorDashboardPage'
import MonitoringPage from '../pages/professor/MonitoringPage'
import ReportsPage from '../pages/professor/ReportsPage'
import ProfessorSettingsPage from '../pages/professor/ProfessorSettingsPage'
import DashboardLayout from '../layouts/DashboardLayout'

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },

  {
    path: '/auth/select-role',
    element: <RoleSelectPage />,
  },

  {
    path: '/login',
    element: <Navigate to="/auth/select-role" replace />,
  },

  {
    path: '/student/login',
    element: <StudentLoginPage />,
  },
  {
    path: '/student/face-capture',
    element: <FaceCapturePage />,
  },
  {
    path: '/student',
    element: <DashboardLayout role="student" />,
    children: [
      {
        path: 'dashboard',
        element: <StudentDashboardPage />,
      },
      {
        path: 'settings',
        element: <StudentSettingsPage />,
      },
    ],
  },

  {
    path: '/professor/login',
    element: <ProfessorLoginPage />,
  },
  {
    path: '/professor',
    element: <DashboardLayout role="professor" />,
    children: [
      {
        path: 'dashboard',
        element: <ProfessorDashboardPage />,
      },
      {
        path: 'monitoring',
        element: <MonitoringPage />,
      },
      {
        path: 'reports',
        element: <ReportsPage />,
      },
      {
        path: 'settings',
        element: <ProfessorSettingsPage />,
      },
    ],
  },

  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])

export default router