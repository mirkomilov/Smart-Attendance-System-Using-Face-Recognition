import { createBrowserRouter, Navigate } from 'react-router-dom'
import LoginPage from '../pages/auth/LoginPage'
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
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
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