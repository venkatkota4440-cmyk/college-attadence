import React from 'react';
import { Bell, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import EmptyState from '../../components/common/EmptyState';

export default function StudentNotifications() {
  const notifications = [
    {
      id: 1,
      title: 'Attendance Shortage Warning',
      message: 'Your current attendance in Database Management Systems is 72%. Minimum 75% required.',
      type: 'WARNING',
      date: 'Today, 10:30 AM',
    },
    {
      id: 2,
      title: 'Attendance Marked',
      message: 'Attendance recorded for Computer Networks (Hour 1) on 01 Oct 2026.',
      type: 'SUCCESS',
      date: '01 Oct 2026',
    },
    {
      id: 3,
      title: 'Mid-Semester Exam Schedule',
      message: 'Mid-Sem 2 examinations timetable has been published. Check student notice board.',
      type: 'INFO',
      date: '28 Sep 2026',
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
        <p className="text-xs text-slate-500">In-app alerts regarding attendance updates and shortage warnings.</p>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`p-4 rounded-2xl border flex items-start gap-4 transition-all ${
              n.type === 'WARNING'
                ? 'bg-amber-50/60 border-amber-200 text-amber-900'
                : n.type === 'SUCCESS'
                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                : 'bg-sky-50/60 border-sky-200 text-sky-900'
            }`}
          >
            <div
              className={`p-2.5 rounded-xl shrink-0 ${
                n.type === 'WARNING'
                  ? 'bg-amber-100 text-amber-700'
                  : n.type === 'SUCCESS'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-sky-100 text-sky-700'
              }`}
            >
              {n.type === 'WARNING' && <AlertTriangle className="w-5 h-5" />}
              {n.type === 'SUCCESS' && <CheckCircle2 className="w-5 h-5" />}
              {n.type === 'INFO' && <Info className="w-5 h-5" />}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm">{n.title}</h4>
                <span className="text-[10px] font-medium text-slate-400">{n.date}</span>
              </div>
              <p className="text-xs mt-1 text-slate-600">{n.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
