import React, { useEffect, useState } from 'react';
import { fetchApi } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import Modal from '../../components/common/Modal';
import { TableSkeleton } from '../../components/common/Skeleton';
import { BookMarked, Plus } from 'lucide-react';

export default function ManageSectionsPage() {
  const [sections, setSections] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [name, setName] = useState('');
  const [courseId, setCourseId] = useState('');
  const [year, setYear] = useState(3);
  const [semester, setSemester] = useState(5);
  const [academicYear, setAcademicYear] = useState('2025-2026');

  const { showSuccess, showError } = useNotification();

  const loadData = async () => {
    try {
      const [sRes, cRes] = await Promise.all([fetchApi('/admin/sections'), fetchApi('/admin/courses')]);
      if (sRes.success) setSections(sRes.data);
      if (cRes.success) setCourses(cRes.data);
    } catch (err) {
      console.error('Failed to load sections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchApi('/admin/sections', {
        method: 'POST',
        body: JSON.stringify({ name, courseId, year: Number(year), semester: Number(semester), academicYear }),
      });
      if (res.success) {
        showSuccess('Section created.');
        setShowAddModal(false);
        loadData();
      }
    } catch (err) {
      showError(err.message || 'Failed to create section.');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Section Management</h1>
          <p className="text-xs text-slate-500">Configure class sections, academic years, and semesters.</p>
        </div>

        <button
          onClick={() => {
            if (courses.length > 0) setCourseId(courses[0].id);
            setShowAddModal(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Section</span>
        </button>
      </div>

      {loading ? (
        <TableSkeleton rows={4} cols={5} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Section Name</th>
                <th className="py-3.5 px-4">Course</th>
                <th className="py-3.5 px-4">Year & Semester</th>
                <th className="py-3.5 px-4">Academic Year</th>
                <th className="py-3.5 px-4">Enrolled Students</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {sections.map((sec) => (
                <tr key={sec.id} className="hover:bg-slate-50/80">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{sec.name}</td>
                  <td className="py-3.5 px-4">{sec.course?.name}</td>
                  <td className="py-3.5 px-4">Year {sec.year}, Sem {sec.semester}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-600">{sec.academicYear}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-700">{sec._count?.students || 0} Students</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Create Section">
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Section Name</label>
            <input
              type="text"
              required
              placeholder="e.g. ECE-A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Course</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Year</label>
              <input
                type="number"
                min={1}
                max={4}
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Semester</label>
              <input
                type="number"
                min={1}
                max={8}
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-500 shadow-md"
            >
              Create Section
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
