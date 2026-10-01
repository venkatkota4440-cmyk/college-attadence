import React, { useEffect, useState } from 'react';
import { fetchApi } from '../../services/api';
import { TableSkeleton } from '../../components/common/Skeleton';
import Badge from '../../components/common/Badge';
import { Download, FileSpreadsheet } from 'lucide-react';

export default function AdminReportsPage() {
  const [sections, setSections] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const res = await fetchApi('/admin/sections');
        if (res.success && res.data.length > 0) {
          setSections(res.data);
          setSelectedSectionId(res.data[0].id);
        }
      } catch (err) {
        console.error('Failed to load sections:', err);
      }
    };
    fetchSections();
  }, []);

  useEffect(() => {
    if (!selectedSectionId) return;

    const fetchReport = async () => {
      setLoading(true);
      try {
        const res = await fetchApi(`/reports/section/${selectedSectionId}`);
        if (res.success) setReport(res.data);
      } catch (err) {
        console.error('Failed to load report:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [selectedSectionId]);

  const handleExportCSV = () => {
    if (!report || !report.students) return;

    const headers = ['Roll Number', 'Student Name', 'Total Classes', 'Present Classes', 'Absent Classes', 'Attendance %', 'Status'];
    const rows = report.students.map((s) => [
      s.rollNumber,
      `"${s.name}"`,
      s.totalClasses,
      s.presentClasses,
      s.absentClasses,
      `${s.percentage}%`,
      s.isShortage ? 'SHORTAGE' : 'SATISFACTORY',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `College_Attendance_Report_Section_${report.sectionInfo.name}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">College Attendance Reports</h1>
          <p className="text-xs text-slate-500">Comprehensive college-wide reports and CSV exports.</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedSectionId}
            onChange={(e) => setSelectedSectionId(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-200 rounded-xl p-2.5 shadow-sm focus:outline-none"
          >
            {sections.map((sec) => (
              <option key={sec.id} value={sec.id}>
                Section {sec.name} ({sec.course?.code})
              </option>
            ))}
          </select>

          <button
            onClick={handleExportCSV}
            disabled={!report}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={8} cols={6} />
      ) : !report ? null : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
              <span className="text-xs font-semibold text-slate-500 uppercase">Section Students</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">{report.summary.totalStudents}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
              <span className="text-xs font-semibold text-slate-500 uppercase">Section Attendance Avg</span>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{report.summary.avgPercentage}%</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
              <span className="text-xs font-semibold text-slate-500 uppercase">Shortage Count (&lt;75%)</span>
              <p className="text-2xl font-bold text-rose-600 mt-1">{report.summary.shortageCount}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Roll No</th>
                  <th className="py-3.5 px-4">Student Name</th>
                  <th className="py-3.5 px-4">Total Classes</th>
                  <th className="py-3.5 px-4">Present</th>
                  <th className="py-3.5 px-4">Absent</th>
                  <th className="py-3.5 px-4">Percentage</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {report.students.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{st.rollNumber}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{st.name}</td>
                    <td className="py-3.5 px-4">{st.totalClasses}</td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-700">{st.presentClasses}</td>
                    <td className="py-3.5 px-4 font-semibold text-rose-700">{st.absentClasses}</td>
                    <td className="py-3.5 px-4 font-extrabold">{st.percentage}%</td>
                    <td className="py-3.5 px-4">
                      <Badge variant={st.isShortage ? 'rose' : 'emerald'}>
                        {st.isShortage ? 'Shortage (<75%)' : 'Satisfactory'}
                      </Badge>
                    </td>
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
