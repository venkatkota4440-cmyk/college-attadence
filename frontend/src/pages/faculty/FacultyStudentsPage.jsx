import React, { useEffect, useState } from 'react';
import { fetchApi } from '../../services/api';
import { TableSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { Search, GraduationCap } from 'lucide-react';

export default function FacultyStudentsPage() {
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetchApi('/faculty/assigned-classes');
        if (res.success && res.data.length > 0) {
          setAssignedClasses(res.data);
          setSelectedSectionId(res.data[0].sectionId);
        }
      } catch (err) {
        console.error('Failed to load assigned classes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    if (!selectedSectionId) return;

    const fetchStudents = async () => {
      setLoading(true);
      try {
        const res = await fetchApi(`/faculty/enrolled-students?sectionId=${selectedSectionId}`);
        if (res.success) setStudents(res.data);
      } catch (err) {
        console.error('Failed to load students:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [selectedSectionId]);

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Enrolled Class Students</h1>
          <p className="text-xs text-slate-500">View enrolled students assigned to your sections.</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedSectionId}
            onChange={(e) => setSelectedSectionId(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-200 rounded-xl p-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
          >
            {assignedClasses.map((ass) => (
              <option key={ass.id} value={ass.sectionId}>
                Section {ass.section.name} ({ass.subject.code})
              </option>
            ))}
          </select>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search student..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={8} cols={4} />
      ) : filteredStudents.length === 0 ? (
        <EmptyState title="No students found" description="No students matched your search filter." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Roll No</th>
                <th className="py-3.5 px-4">Student Name</th>
                <th className="py-3.5 px-4">Student ID</th>
                <th className="py-3.5 px-4">Email Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {filteredStudents.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{st.rollNumber}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{st.name}</td>
                  <td className="py-3.5 px-4 text-slate-500">{st.studentId}</td>
                  <td className="py-3.5 px-4 text-slate-500">{st.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
