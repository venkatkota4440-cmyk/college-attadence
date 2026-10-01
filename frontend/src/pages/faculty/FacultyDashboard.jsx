import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import { CardSkeleton } from '../../components/common/Skeleton';
import { CheckCircle2, BookOpen, Users, Clock, ArrowRight, PlusCircle, BarChart3 } from 'lucide-react';

export default function FacultyDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await fetchApi('/faculty/dashboard');
        if (res.success) setData(res.data);
      } catch (err) {
        console.error('Failed to load faculty dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (loading) return <div className="p-6"><CardSkeleton /></div>;

  const { facultyInfo, assignments, recentSessions } = data;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Faculty Welcome Banner */}
      <div className="bg-gradient-to-r from-academic-navy via-slate-900 to-indigo-900 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider text-primary-300">
            Faculty Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2">Welcome, {facultyInfo.name}</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {facultyInfo.designation} &bull; {facultyInfo.department} (Emp ID: {facultyInfo.employeeId})
          </p>
        </div>

        <button
          onClick={() => navigate('/faculty/take-attendance')}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary-600 hover:bg-primary-500 font-bold text-sm text-white shadow-lg shadow-primary-900/40 transition-all cursor-pointer"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Take Attendance</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Assigned Subjects & Sections"
          value={assignments.length}
          subtitle="Active Academic Year 2025-26"
          icon={BookOpen}
          color="primary"
        />
        <StatCard
          title="Recent Sessions Conducted"
          value={recentSessions.length}
          subtitle="Past 30 Days"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Department"
          value={facultyInfo.department}
          subtitle="Engineering Faculty"
          icon={Users}
          color="indigo"
        />
      </div>

      {/* Assigned Classes */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4">My Assigned Classes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.map((ass) => (
            <div
              key={ass.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                    {ass.subject.code}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 text-xs font-bold border border-primary-200">
                    Section {ass.section.name}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-base">{ass.subject.name}</h4>
                <p className="text-xs text-slate-500 mt-1">Course: {ass.section.course?.name}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Credits: {ass.subject.credits}</span>
                <button
                  onClick={() =>
                    navigate(
                      `/faculty/take-attendance?subjectId=${ass.subjectId}&sectionId=${ass.sectionId}`
                    )
                  }
                  className="flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-800 cursor-pointer"
                >
                  <span>Mark Attendance</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Sessions Table */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Attendance Sessions</h3>
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Hour</th>
                <th className="py-3.5 px-4">Subject</th>
                <th className="py-3.5 px-4">Section</th>
                <th className="py-3.5 px-4">Present / Total</th>
                <th className="py-3.5 px-4">Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {recentSessions.map((session) => (
                <tr key={session.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{session.date}</td>
                  <td className="py-3.5 px-4">Hour {session.hour}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{session.subject}</div>
                    <div className="text-[10px] text-slate-500">{session.subjectCode}</div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">{session.section}</td>
                  <td className="py-3.5 px-4">
                    <span className="text-emerald-700 font-bold">{session.present}</span> / {session.totalStudents}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
                        session.percentage >= 75
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {session.percentage}%
                    </span>
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
