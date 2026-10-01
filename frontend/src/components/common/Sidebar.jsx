import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  CalendarCheck,
  BarChart3,
  FileSpreadsheet,
  ShieldCheck,
  Settings,
  Clock,
  User,
  Bell,
  CheckCircle2,
  BookMarked,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  const adminNav = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Students', path: '/admin/students', icon: GraduationCap },
    { label: 'Faculty', path: '/admin/faculty', icon: Users },
    { label: 'Departments', path: '/admin/departments', icon: Building2 },
    { label: 'Courses', path: '/admin/courses', icon: Layers },
    { label: 'Sections', path: '/admin/sections', icon: BookMarked },
    { label: 'Subjects', path: '/admin/subjects', icon: BookOpen },
    { label: 'Assignments', path: '/admin/assignments', icon: CalendarCheck },
    { label: 'Attendance Sessions', path: '/admin/attendance', icon: CheckCircle2 },
    { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: ShieldCheck },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const facultyNav = [
    { label: 'Dashboard', path: '/faculty/dashboard', icon: LayoutDashboard },
    { label: 'Take Attendance', path: '/faculty/take-attendance', icon: CheckCircle2 },
    { label: 'Attendance History', path: '/faculty/history', icon: Clock },
    { label: 'Enrolled Students', path: '/faculty/students', icon: GraduationCap },
    { label: 'Class Reports', path: '/faculty/reports', icon: FileSpreadsheet },
  ];

  const studentNav = [
    { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'My Attendance', path: '/student/attendance', icon: CheckCircle2 },
    { label: 'Timetable', path: '/student/timetable', icon: Clock },
    { label: 'Profile', path: '/student/profile', icon: User },
    { label: 'Notifications', path: '/student/notifications', icon: Bell },
  ];

  const navItems = role === 'ADMIN' ? adminNav : role === 'FACULTY' ? facultyNav : studentNav;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-6 bg-slate-950 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md">
            CA
          </div>
          <div>
            <h1 className="font-bold text-lg text-white leading-tight tracking-wide">
              Campus<span className="text-primary-400">Attend</span>
            </h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">College SaaS</p>
          </div>
        </div>

        {/* User Badge */}
        <div className="px-4 py-4 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-3 bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
            <div className="w-8 h-8 rounded-lg bg-primary-600/30 border border-primary-500/30 text-primary-300 flex items-center justify-center font-semibold text-xs">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{user.name}</p>
              <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-300 border border-primary-500/30 mt-0.5">
                {role}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-md shadow-primary-900/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 text-center text-[11px] text-slate-500">
          CampusAttend v1.0 &copy; 2026
        </div>
      </aside>
    </>
  );
}
