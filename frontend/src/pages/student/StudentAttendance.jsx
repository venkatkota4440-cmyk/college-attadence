import React, { useEffect, useState } from 'react';
import { fetchApi } from '../../services/api';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/Skeleton';
import { Calendar, Filter, Clock, User, BookOpen } from 'lucide-react';

export default function StudentAttendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const query = statusFilter ? `?status=${statusFilter}` : '';
        const res = await fetchApi(`/student/attendance-history${query}`);
        if (res.success) setRecords(res.data);
      } catch (err) {
        console.error('Failed to fetch attendance history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [statusFilter]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Attendance Records</h1>
          <p className="text-xs text-slate-500">Detailed list of recorded class attendance sessions.</p>
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="PRESENT">PRESENT</option>
            <option value="ABSENT">ABSENT</option>
            <option value="LATE">LATE</option>
            <option value="EXCUSED">EXCUSED</option>
          </select>
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={8} cols={6} />
      ) : records.length === 0 ? (
        <EmptyState title="No attendance records found" description="There are no records matching your selected filter criteria." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Hour</th>
                  <th className="py-3.5 px-4">Subject</th>
                  <th className="py-3.5 px-4">Faculty</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{rec.session.date}</td>
                    <td className="py-3.5 px-4">Hour {rec.session.hour}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{rec.session.subject.name}</div>
                      <div className="text-[10px] text-slate-500">{rec.session.subject.code}</div>
                    </td>
                    <td className="py-3.5 px-4">{rec.session.faculty.name}</td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          rec.status === 'PRESENT'
                            ? 'emerald'
                            : rec.status === 'ABSENT'
                            ? 'rose'
                            : rec.status === 'LATE'
                            ? 'amber'
                            : 'indigo'
                        }
                      >
                        {rec.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{rec.remarks || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
