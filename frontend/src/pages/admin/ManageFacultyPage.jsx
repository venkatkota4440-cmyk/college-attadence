import React, { useEffect, useState } from 'react';
import { fetchApi } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import { TableSkeleton } from '../../components/common/Skeleton';
import { Plus, Search, Edit, UserCheck, Users } from 'lucide-react';

export default function ManageFacultyPage() {
  const [faculty, setFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);

  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    email: '',
    phone: '',
    departmentId: '',
    designation: 'Assistant Professor',
    password: 'Password123!',
  });

  const { showSuccess, showError } = useNotification();

  const loadData = async () => {
    setLoading(true);
    try {
      const [fRes, dRes] = await Promise.all([fetchApi('/admin/faculty'), fetchApi('/admin/departments')]);
      if (fRes.success) setFaculty(fRes.data);
      if (dRes.success) setDepartments(dRes.data);
    } catch (err) {
      console.error('Failed to load faculty:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateFaculty = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchApi('/admin/faculty', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (res.success) {
        showSuccess('Faculty account created successfully!');
        setShowAddModal(false);
        loadData();
      }
    } catch (err) {
      showError(err.message || 'Failed to create faculty.');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Faculty Management</h1>
          <p className="text-xs text-slate-500">Manage teaching staff accounts, designations, and department affiliations.</p>
        </div>

        <button
          onClick={() => {
            if (departments.length > 0) setFormData((p) => ({ ...p, departmentId: departments[0].id }));
            setShowAddModal(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Faculty Member</span>
        </button>
      </div>

      {loading ? (
        <TableSkeleton rows={6} cols={5} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Emp ID</th>
                <th className="py-3.5 px-4">Faculty Name</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Designation</th>
                <th className="py-3.5 px-4">Assigned Subjects</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {faculty.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{f.employeeId}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{f.name}</div>
                    <div className="text-[10px] text-slate-400">{f.email}</div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">{f.department?.code}</td>
                  <td className="py-3.5 px-4">{f.designation}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-primary-700">{f.facultyAssignments?.length || 0} Classes</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Faculty Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Create Faculty Member">
        <form onSubmit={handleCreateFaculty} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Employee ID</label>
              <input
                type="text"
                required
                placeholder="EMP-CSE-006"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Department</label>
              <select
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Faculty Name</label>
            <input
              type="text"
              required
              placeholder="Dr. Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="faculty6@campusattend.local"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Designation</label>
            <select
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="Professor & HOD">Professor & HOD</option>
              <option value="Professor">Professor</option>
              <option value="Associate Professor">Associate Professor</option>
              <option value="Assistant Professor">Assistant Professor</option>
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
              Create Account
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
