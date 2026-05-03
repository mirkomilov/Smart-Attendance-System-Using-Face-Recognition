export const ATTENDANCE_HISTORY = [
  { id: 1, course: 'Machine Learning', date: '2024-03-10', time: '09:00 AM', status: 'present', room: 'L-201' },
  { id: 2, course: 'Database Systems', date: '2024-03-09', time: '11:30 AM', status: 'present', room: 'C-105' },
  { id: 3, course: 'Web Development', date: '2024-03-08', time: '02:00 PM', status: 'absent', room: 'W-302' },
  { id: 4, course: 'Computer Networks', date: '2024-03-07', time: '10:00 AM', status: 'present', room: 'N-110' },
  { id: 5, course: 'Software Engineering', date: '2024-03-06', time: '01:00 PM', status: 'present', room: 'S-401' },
]

export const MONITORING_DATA = [
  { id: 1, name: 'Alex Johnson', studentId: 'S1001', status: 'Present', time: '09:02 AM', confidence: '98%' },
  { id: 2, name: 'Sarah Williams', studentId: 'S1002', status: 'Present', time: '09:05 AM', confidence: '95%' },
  { id: 3, name: 'Michael Brown', studentId: 'S1003', status: 'Pending', time: '-', confidence: '-' },
  { id: 4, name: 'Emily Davis', studentId: 'S1004', status: 'Present', time: '09:01 AM', confidence: '99%' },
  { id: 5, name: 'David Wilson', studentId: 'S1005', status: 'Absent', time: '-', confidence: '-' },
]

export const REPORT_DATA = [
  { name: 'Mon', attendance: 85 },
  { name: 'Tue', attendance: 92 },
  { name: 'Wed', attendance: 78 },
  { name: 'Thu', attendance: 95 },
  { name: 'Fri', attendance: 88 },
]

export const PIE_DATA = [
  { name: 'Present', value: 75, color: '#0ea5e9' },
  { name: 'Absent', value: 15, color: '#ef4444' },
  { name: 'Late', value: 10, color: '#f59e0b' },
]

export const SUBJECTS_DATA = [
  { id: 1, course: 'Cloud Computing', professor: 'Missis Sokhibjamol Boeva Hossein Rezaei', attended: 37, total: 45 },
  { id: 2, course: 'Graduation Project and Internship', professor: 'Doctor Eugene Castro', attended: 37, total: 45 },
  { id: 3, course: 'Organizational Behavior', professor: 'Munisa Bekmirzaeva', attended: 36, total: 45 },
  { id: 4, course: 'Software Engineering', professor: 'Dr. John Doe', attended: 42, total: 45 },
]

export const WEEKLY_SCHEDULE = [
  {
    id: 'mon',
    day: 'Monday',
    date: 'Mar 11',
    classes: [
      { id: 1, course: 'Cloud Computing', time: '09:00 AM - 10:30 AM', room: 'L-201', status: 'present', professor: 'Missis Sokhibjamol Boeva Hossein Rezaei' },
      { id: 2, course: 'Graduation Project and Internship', time: '11:00 AM - 12:30 PM', room: 'C-105', status: 'absent', professor: 'Doctor Eugene Castro' }
    ]
  },
  {
    id: 'tue',
    day: 'Tuesday',
    date: 'Mar 12',
    classes: [
      { id: 3, course: 'Organizational Behavior', time: '09:00 AM - 10:30 AM', room: 'W-302', status: 'present', professor: 'Munisa Bekmirzaeva' },
      { id: 4, course: 'Software Engineering', time: '02:00 PM - 03:30 PM', room: 'N-110', status: 'upcoming', professor: 'Dr. John Doe' }
    ]
  },
  {
    id: 'wed',
    day: 'Wednesday',
    date: 'Mar 13',
    classes: [
      { id: 5, course: 'Cloud Computing', time: '10:00 AM - 11:30 AM', room: 'L-201', status: 'upcoming', professor: 'Missis Sokhibjamol Boeva Hossein Rezaei' }
    ]
  },
  {
    id: 'thu',
    day: 'Thursday',
    date: 'Mar 14',
    classes: [
      { id: 6, course: 'Graduation Project and Internship', time: '09:00 AM - 10:30 AM', room: 'C-105', status: 'upcoming', professor: 'Doctor Eugene Castro' }
    ]
  },
  {
    id: 'fri',
    day: 'Friday',
    date: 'Mar 15',
    classes: [
      { id: 7, course: 'Organizational Behavior', time: '11:00 AM - 12:30 PM', room: 'W-302', status: 'upcoming', professor: 'Munisa Bekmirzaeva' },
      { id: 8, course: 'Software Engineering', time: '02:00 PM - 03:30 PM', room: 'N-110', status: 'upcoming', professor: 'Dr. John Doe' }
    ]
  }
]

export const PROFESSOR_SCHEDULE = [
  {
    id: 'mon',
    day: 'Monday',
    classes: [
      { id: 1, course: 'Machine Learning', time: '09:00 AM - 10:30 AM', room: 'L-201', group: 'CS-A', type: 'Lecture' },
      { id: 2, course: 'Machine Learning (Lab)', time: '11:00 AM - 12:30 PM', room: 'Lab-1', group: 'CS-A', type: 'Lab' }
    ]
  },
  {
    id: 'tue',
    day: 'Tuesday',
    classes: [
      { id: 3, course: 'Artificial Intelligence', time: '09:00 AM - 10:30 AM', room: 'C-102', group: 'SE-B', type: 'Lecture' },
    ]
  },
  {
    id: 'wed',
    day: 'Wednesday',
    classes: [
      { id: 4, course: 'Machine Learning', time: '10:00 AM - 11:30 AM', room: 'L-201', group: 'CS-C', type: 'Lecture' }
    ]
  },
  {
    id: 'thu',
    day: 'Thursday',
    classes: [
      { id: 5, course: 'Artificial Intelligence (Lab)', time: '09:00 AM - 10:30 AM', room: 'Lab-2', group: 'SE-B', type: 'Lab' }
    ]
  },
  {
    id: 'fri',
    day: 'Friday',
    classes: [
      { id: 6, course: 'Machine Learning', time: '11:00 AM - 12:30 PM', room: 'L-201', group: 'CS-A', type: 'Lecture' },
    ]
  }
]

export const GROUP_STUDENTS = {
  'CS-A': [
    { id: 1, name: 'Alex Johnson', studentId: 'S1001', attendance: { 'Mar 11': 'present', 'Mar 13': 'present', 'Mar 15': 'absent', 'Mar 18': 'present', 'Mar 20': 'late' } },
    { id: 2, name: 'Sarah Williams', studentId: 'S1002', attendance: { 'Mar 11': 'present', 'Mar 13': 'present', 'Mar 15': 'present', 'Mar 18': 'present', 'Mar 20': 'present' } },
    { id: 3, name: 'Michael Brown', studentId: 'S1003', attendance: { 'Mar 11': 'absent', 'Mar 13': 'absent', 'Mar 15': 'present', 'Mar 18': 'late', 'Mar 20': 'present' } },
    { id: 4, name: 'Emily Davis', studentId: 'S1004', attendance: { 'Mar 11': 'present', 'Mar 13': 'present', 'Mar 15': 'present', 'Mar 18': 'present', 'Mar 20': 'present' } },
    { id: 5, name: 'David Wilson', studentId: 'S1005', attendance: { 'Mar 11': 'late', 'Mar 13': 'present', 'Mar 15': 'absent', 'Mar 18': 'absent', 'Mar 20': 'present' } },
  ],
  'SE-B': [
    { id: 6, name: 'Jessica Taylor', studentId: 'S1006', attendance: { 'Mar 12': 'present', 'Mar 14': 'present', 'Mar 19': 'present', 'Mar 21': 'present' } },
    { id: 7, name: 'Chris Evans', studentId: 'S1007', attendance: { 'Mar 12': 'absent', 'Mar 14': 'present', 'Mar 19': 'late', 'Mar 21': 'absent' } },
    { id: 8, name: 'Anna White', studentId: 'S1008', attendance: { 'Mar 12': 'present', 'Mar 14': 'present', 'Mar 19': 'present', 'Mar 21': 'present' } },
  ],
  'CS-C': [
    { id: 9, name: 'Tom Hardy', studentId: 'S1009', attendance: { 'Mar 13': 'late', 'Mar 15': 'present', 'Mar 20': 'absent' } },
    { id: 10, name: 'Emma Stone', studentId: 'S1010', attendance: { 'Mar 13': 'present', 'Mar 15': 'present', 'Mar 20': 'present' } },
    { id: 11, name: 'Mark Ruffalo', studentId: 'S1011', attendance: { 'Mar 13': 'absent', 'Mar 15': 'absent', 'Mar 20': 'absent' } },
  ]
}