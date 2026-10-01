import React, { useEffect, useState } from 'react';
import { fetchApi } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import ShortageBadge from '../../components/attendance/ShortageBadge';
import { CardSkeleton } from '../../components/common/Skeleton';
import { CheckCircle2, XCircle, AlertTriangle, BookOpen, Clock, Calendar, Award } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from 'recharts';

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await fetchApi('/student/dashboard');
        if (res.success) setData(res.data);
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { studentInfo, summary, subjects, monthlyTrend } = data;

  const pieData = [
    { name: 'Present', value: summary.presentClasses, color: '#10b981' },
    { name: 'Absent', value: summary.absentClasses, color: '#f43f5e' },
    { name: 'Excused', value: summary.excusedClasses, color: '#6366f1' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Student Welcome Banner */}
      <div className="bg-gradient-to-r from-academic-blue via-primary-700 to-indigo-800 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="z-10">
          <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider text-primary-200">
            Student Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2">Welcome, {studentInfo.name}!</h1>
          <p className="text-xs sm:text-sm text-slate-200 mt-1">
            Roll No: <span className="font-semibold text-white">{studentInfo.rollNumber}</span> &bull; {studentInfo.department} &bull; Section {studentInfo.section} (Semester {studentInfo.semester})
          </p>
        </div>
        <div className="z-10 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 text-center">
          <ShortageBadge percentage={summary.overallPercentage} requiredPercentage={75} />
        </div>
      </div>

      {/* Shortage Warning Banner */}
      {summary.isShortage && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-4 text-rose-900 shadow-sm">
          <div className="p-2 bg-rose-100 rounded-xl text-rose-600 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-rose-900">Attendance Shortage Alert</h4>
            <p className="text-xs text-rose-700 mt-0.5">
              Your overall attendance is currently <span className="font-bold">{summary.overallPercentage}%</span>, which is below the mandatory <span className="font-bold">75%</span> requirement. You are short by <span className="font-bold">{summary.shortageMargin}%</span>. Please attend remaining classes to avoid exam hall ticket detention.
            </p>
          </div>
        </div>
      )}

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Attendance"
          value={`${summary.overallPercentage}%`}
          subtitle="Minimum 75% Required"
          icon={Award}
          color={summary.overallPercentage >= 75 ? 'emerald' : 'rose'}
        />
        <StatCard
          title="Total Conducted Classes"
          value={summary.totalClasses}
          subtitle="Semester 5"
          icon={BookOpen}
          color="primary"
        />
        <StatCard
          title="Present Classes"
          value={summary.presentClasses}
          subtitle="Attended Classes"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Absent Classes"
          value={summary.absentClasses}
          subtitle="Missed Classes"
          icon={XCircle}
          color="rose"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Distribution Donut Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <h3 className="text-base font-bold text-slate-800 mb-2">Overall Attendance Breakdown</h3>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 text-xs font-semibold text-slate-600 mt-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Present ({summary.presentClasses})
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span> Absent ({summary.absentClasses})
            </div>
          </div>
        </div>

        {/* Subject Wise Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 mb-4">Subject-wise Attendance (%)</h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjects}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="code" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip formatter={(value) => [`${value}%`, 'Attendance']} />
                <Bar dataKey="percentage" radius={[8, 8, 0, 0]}>
                  {subjects.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.percentage >= 75 ? '#0c8ee9' : '#f43f5e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Subject Cards Grid */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4">Enrolled Subjects & Attendance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subj) => (
            <div
              key={subj.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                    {subj.code}
                  </span>
                  <span
                    className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                      subj.percentage >= 75
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {subj.percentage}%
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-base leading-tight">{subj.name}</h4>
                <p className="text-xs text-slate-500 mt-1">Faculty: {subj.facultyName}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 flex justify-between items-center">
                <span>Conducted: <strong className="text-slate-800">{subj.total}</strong></span>
                <span>Present: <strong className="text-emerald-700">{subj.present}</strong></span>
                <span>Absent: <strong className="text-rose-700">{subj.absent}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
