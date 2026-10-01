import React, { useEffect, useState } from 'react';
import { fetchApi } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import Modal from '../../components/common/Modal';
import { TableSkeleton } from '../../components/common/Skeleton';
import { Layers, Plus } from 'lucide-react';

export default function ManageCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [durationYears, setDurationYears] = useState(4);

  const { showSuccess, showError } = useNotification();

  const loadCourses = async () => {
    try {
      const [cRes, dRes] = await Promise.all([fetchApi('/admin/courses'), fetchApi('/admin/departments')]);
      if (cRes.success) setCourses(cRes.data);
      if (dRes.success) setDepartments(dRes.data);
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchApi('/admin/courses', {
        method: 'POST',
        body: JSON.stringify({ name, code, departmentId, durationYears: Number(durationYears) }),
      });
      if (res.success) {
        showSuccess('Course created.');
        setShowAddModal(false);
        loadCourses();
      }
    } catch (err) {
      showError(err.message || 'Failed to create course.');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Course Management</h1>
          <p className="text-xs text-slate-500">Degree programs and academic courses configuration.</p>
        </div>

        <button
          onClick={() => {
            if (departments.length > 0) setDepartmentId(departments[0].id);
            setShowAddModal(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Course</span>
        </button>
      </div>

      {loading ? (
        <TableSkeleton rows={4} cols={4} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Code</th>
                <th className="py-3.5 px-4">Course Title</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Duration</th>
                <th className="py-3.5 px-4">Sections</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {courses.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{c.code}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{c.name}</td>
                  <td className="py-3.5 px-4">{c.department?.name}</td>
                  <td className="py-3.5 px-4">{c.durationYears} Years</td>
                  <td className="py-3.5 px-4 font-bold text-primary-700">{c._count?.sections || 0} Sections</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Create Course">
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Course Code</label>
            <input
              type="text"
              required
              placeholder="e.g. BTECH-EEE"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Course Name</label>
            <input
              type="text"
              required
              placeholder="e.g. B.Tech Electrical & Electronics Engineering"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Department</label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
              ))}
            </select>
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
              Create Course
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
