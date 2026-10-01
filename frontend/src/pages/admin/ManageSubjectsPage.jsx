import React, { useEffect, useState } from 'react';
import { fetchApi } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import Modal from '../../components/common/Modal';
import { TableSkeleton } from '../../components/common/Skeleton';
import { BookOpen, Plus } from 'lucide-react';

export default function ManageSubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [credits, setCredits] = useState(4);
  const [semester, setSemester] = useState(5);
  const [departmentId, setDepartmentId] = useState('');
  const [courseId, setCourseId] = useState('');

  const { showSuccess, showError } = useNotification();

  const loadData = async () => {
    try {
      const [subRes, dRes, cRes] = await Promise.all([
        fetchApi('/admin/subjects'),
        fetchApi('/admin/departments'),
        fetchApi('/admin/courses'),
      ]);
      if (subRes.success) setSubjects(subRes.data);
      if (dRes.success) setDepartments(dRes.data);
      if (cRes.success) setCourses(cRes.data);
    } catch (err) {
      console.error('Failed to load subjects:', err);
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
      const res = await fetchApi('/admin/subjects', {
        method: 'POST',
        body: JSON.stringify({ name, code, credits: Number(credits), semester: Number(semester), courseId, departmentId }),
      });
      if (res.success) {
        showSuccess('Subject created.');
        setShowAddModal(false);
        loadData();
      }
    } catch (err) {
      showError(err.message || 'Failed to create subject.');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Subject Management</h1>
          <p className="text-xs text-slate-500">Configure subjects, course credits, and curriculum semesters.</p>
        </div>

        <button
          onClick={() => {
            if (departments.length > 0) setDepartmentId(departments[0].id);
            if (courses.length > 0) setCourseId(courses[0].id);
            setShowAddModal(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subject</span>
        </button>
      </div>

      {loading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Subject Code</th>
                <th className="py-3.5 px-4">Subject Title</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Semester</th>
                <th className="py-3.5 px-4">Credits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {subjects.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50/80">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{sub.code}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{sub.name}</td>
                  <td className="py-3.5 px-4">{sub.department?.code}</td>
                  <td className="py-3.5 px-4">Semester {sub.semester}</td>
                  <td className="py-3.5 px-4 font-bold text-primary-700">{sub.credits} Credits</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Create Subject">
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Subject Code</label>
              <input
                type="text"
                required
                placeholder="e.g. CS506"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Credits</label>
              <input
                type="number"
                min={1}
                max={6}
                value={credits}
                onChange={(e) => setCredits(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
          <div>
            <label className="block font-semibold mb-1">Subject Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Artificial Intelligence"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Department</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.code}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Course</label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.code}</option>
                ))}
              </select>
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
              Create Subject
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
