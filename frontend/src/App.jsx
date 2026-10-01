import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Sidebar from './components/common/Sidebar';
import Header from './components/common/Header';

import LoginPage from './pages/LoginPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentTimetable from './pages/student/StudentTimetable';
import StudentProfile from './pages/student/StudentProfile';
import StudentNotifications from './pages/student/StudentNotifications';

// Faculty Pages
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import TakeAttendancePage from './pages/faculty/TakeAttendancePage';
import FacultyHistoryPage from './pages/faculty/FacultyHistoryPage';
import FacultyStudentsPage from './pages/faculty/FacultyStudentsPage';
import FacultyReportsPage from './pages/faculty/FacultyReportsPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageStudentsPage from './pages/admin/ManageStudentsPage';
import ManageFacultyPage from './pages/admin/ManageFacultyPage';
import ManageDepartmentsPage from './pages/admin/ManageDepartmentsPage';
import ManageCoursesPage from './pages/admin/ManageCoursesPage';
import ManageSectionsPage from './pages/admin/ManageSectionsPage';
import ManageSubjectsPage from './pages/admin/ManageSubjectsPage';
import ManageAssignmentsPage from './pages/admin/ManageAssignmentsPage';
import AdminAttendancePage from './pages/admin/AdminAttendancePage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';
import SettingsPage from './pages/admin/SettingsPage';

function ProtectedLayout({ allowedRoles }) {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-bold">
        Loading CampusAttend...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'FACULTY') return <Navigate to="/faculty/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 pb-12">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* Student Routes */}
            <Route element={<ProtectedLayout allowedRoles={['STUDENT']} />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/attendance" element={<StudentAttendance />} />
              <Route path="/student/timetable" element={<StudentTimetable />} />
              <Route path="/student/profile" element={<StudentProfile />} />
              <Route path="/student/notifications" element={<StudentNotifications />} />
            </Route>

            {/* Faculty Routes */}
            <Route element={<ProtectedLayout allowedRoles={['FACULTY']} />}>
              <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
              <Route path="/faculty/take-attendance" element={<TakeAttendancePage />} />
              <Route path="/faculty/history" element={<FacultyHistoryPage />} />
              <Route path="/faculty/students" element={<FacultyStudentsPage />} />
              <Route path="/faculty/reports" element={<FacultyReportsPage />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedLayout allowedRoles={['ADMIN']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/students" element={<ManageStudentsPage />} />
              <Route path="/admin/faculty" element={<ManageFacultyPage />} />
              <Route path="/admin/departments" element={<ManageDepartmentsPage />} />
              <Route path="/admin/courses" element={<ManageCoursesPage />} />
              <Route path="/admin/sections" element={<ManageSectionsPage />} />
              <Route path="/admin/subjects" element={<ManageSubjectsPage />} />
              <Route path="/admin/assignments" element={<ManageAssignmentsPage />} />
              <Route path="/admin/attendance" element={<AdminAttendancePage />} />
              <Route path="/admin/reports" element={<AdminReportsPage />} />
              <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
              <Route path="/admin/settings" element={<SettingsPage />} />
            </Route>

            {/* Root Redirect */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}
