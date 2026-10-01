import React, { useEffect, useState } from 'react';
import { fetchApi } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import { CardSkeleton } from '../../components/common/Skeleton';
import { Users, GraduationCap, Building2, BookOpen, AlertTriangle, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetchApi('/admin/dashboard');
        if (res.success) setData(res.data);
      } catch (err) {
        console.error('Failed to load admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) return <div className="p-6"><CardSkeleton /></div>;

  const { cards, deptAttendance, shortageStudents, recentSessions } = data;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-academic-navy to-indigo-950 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider text-primary-300">
            College Administration Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2">CampusAttend Control Center</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Narasaraopet Engineering College &bull; Academic Year 2025-2026
          </p>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={cards.totalStudents} subtitle="Enrolled" icon={GraduationCap} color="primary" />
        <StatCard title="Faculty Members" value={cards.totalFaculty} subtitle="Teaching Staff" icon={Users} color="indigo" />
        <StatCard title="Departments" value={cards.totalDepartments} subtitle="Academic Wings" icon={Building2} color="emerald" />
        <StatCard title="Students in Shortage" value={cards.shortageCount} subtitle="Attendance < 75%" icon={AlertTriangle} color="rose" />
      </div>

      {/* Analytics Charts & Shortage Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department-wise Attendance Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 mb-4">Department-wide Attendance Average (%)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptAttendance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="code" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip formatter={(val) => [`${val}%`, 'Attendance']} />
                <Bar dataKey="percentage" radius={[8, 8, 0, 0]}>
                  {deptAttendance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.percentage >= 75 ? '#0c8ee9' : '#f43f5e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Shortage Watchlist Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800">Shortage Watchlist</h3>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                {shortageStudents.length} Students
              </span>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
              {shortageStudents.map((st) => (
                <div key={st.id} className="p-3 bg-rose-50/50 rounded-xl border border-rose-100 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">{st.name}</h5>
                    <p className="text-[10px] text-slate-500">{st.rollNumber} &bull; {st.section}</p>
                  </div>
                  <span className="text-xs font-extrabold text-rose-700">{st.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sessions Table */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4">Recent College Attendance Sessions</h3>
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Subject</th>
                <th className="py-3.5 px-4">Section</th>
                <th className="py-3.5 px-4">Faculty</th>
                <th className="py-3.5 px-4">Present / Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {recentSessions.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{s.date} (H{s.hour})</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{s.subject}</td>
                  <td className="py-3.5 px-4">{s.section}</td>
                  <td className="py-3.5 px-4">{s.faculty}</td>
                  <td className="py-3.5 px-4">
                    <span className="text-emerald-700 font-bold">{s.presentCount}</span> / {s.totalStudents}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
