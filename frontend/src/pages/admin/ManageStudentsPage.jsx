import React, { useEffect, useState } from 'react';
import { fetchApi } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/Skeleton';
import { Plus, Upload, Search, Edit, UserCheck, UserX, Download, FileSpreadsheet } from 'lucide-react';

export default function ManageStudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [sections, setSections] = useState([]);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const [formData, setFormData] = useState({
    studentId: '',
    rollNumber: '',
    name: '',
    email: '',
    phone: '',
    departmentId: '',
    courseId: '',
    sectionId: '',
    year: 3,
    semester: 5,
    academicYear: '2025-2026',
    admissionYear: 2023,
    password: 'Password123!',
  });

  const [csvText, setCsvText] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const { showSuccess, showError } = useNotification();

  const loadData = async () => {
    setLoading(true);
    try {
      const q = `?page=${page}&search=${search}`;
      const res = await fetchApi(`/admin/students${q}`);
      if (res.success) {
        setStudents(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMetadata = async () => {
    try {
      const [dRes, cRes, sRes] = await Promise.all([
        fetchApi('/admin/departments'),
        fetchApi('/admin/courses'),
        fetchApi('/admin/sections'),
      ]);
      if (dRes.success) setDepartments(dRes.data);
      if (cRes.success) setCourses(cRes.data);
      if (sRes.success) setSections(sRes.data);
    } catch (err) {}
  };

  useEffect(() => {
    loadMetadata();
  }, []);

  useEffect(() => {
    loadData();
  }, [page, search]);

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchApi('/admin/students', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (res.success) {
        showSuccess('Student account created successfully!');
        setShowAddModal(false);
        loadData();
      }
    } catch (err) {
      showError(err.message || 'Failed to create student.');
    }
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchApi(`/admin/students/${editingStudent.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editingStudent.name,
          phone: editingStudent.phone,
          departmentId: editingStudent.departmentId,
          courseId: editingStudent.courseId,
          sectionId: editingStudent.sectionId,
          isActive: editingStudent.isActive,
        }),
      });

      if (res.success) {
        showSuccess('Student details updated.');
        setEditingStudent(null);
        loadData();
      }
    } catch (err) {
      showError(err.message || 'Failed to update student.');
    }
  };

  const handleBulkImport = async () => {
    if (!csvText.trim()) {
      showError('Please paste CSV content to import.');
      return;
    }

    setImporting(true);
    try {
      const lines = csvText.trim().split('\n');
      const parsedStudents = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const [studentId, rollNumber, name, email, departmentCode, sectionName] = line.split(',').map((s) => s.trim());

        const dept = departments.find((d) => d.code === departmentCode) || departments[0];
        const course = courses[0];
        const section = sections.find((s) => s.name === sectionName) || sections[0];

        parsedStudents.push({
          studentId,
          rollNumber,
          name,
          email,
          departmentId: dept ? dept.id : '',
          courseId: course ? course.id : '',
          sectionId: section ? section.id : '',
          year: 3,
          semester: 5,
        });
      }

      const res = await fetchApi('/admin/students/bulk-import', {
        method: 'POST',
        body: JSON.stringify({ students: parsedStudents }),
      });

      if (res.success) {
        setImportResult(res.results);
        showSuccess(res.message);
        loadData();
      }
    } catch (err) {
      showError(err.message || 'Bulk import failed.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Student Management</h1>
          <p className="text-xs text-slate-500">Manage student profiles, section enrollments, and CSV imports.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>CSV Import</span>
          </button>
          <button
            onClick={() => {
              if (departments.length > 0 && courses.length > 0 && sections.length > 0) {
                setFormData((prev) => ({
                  ...prev,
                  departmentId: departments[0].id,
                  courseId: courses[0].id,
                  sectionId: sections[0].id,
                }));
              }
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, roll number, student ID, or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full text-xs bg-transparent focus:outline-none text-slate-800 placeholder-slate-400"
        />
      </div>

      {/* Students Table */}
      {loading ? (
        <TableSkeleton rows={8} cols={6} />
      ) : students.length === 0 ? (
        <EmptyState title="No students found" description="Try refining your search filter or add a new student." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Roll No</th>
                  <th className="py-3.5 px-4">Student Name</th>
                  <th className="py-3.5 px-4">Department & Course</th>
                  <th className="py-3.5 px-4">Section</th>
                  <th className="py-3.5 px-4">Attendance %</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {students.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{st.rollNumber}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{st.name}</div>
                      <div className="text-[10px] text-slate-400">{st.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div>{st.department?.code}</div>
                      <div className="text-[10px] text-slate-400">{st.course?.code}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{st.section?.name}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant={st.attendancePercentage >= 75 ? 'emerald' : 'rose'}>
                        {st.attendancePercentage}%
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setEditingStudent(st)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Create Student Account">
        <form onSubmit={handleCreateStudent} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Student ID</label>
              <input
                type="text"
                required
                placeholder="STU-2026-1051"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Roll Number</label>
              <input
                type="text"
                required
                placeholder="21A51"
                value={formData.rollNumber}
                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="Student Name"
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
              placeholder="student51@campusattend.local"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold mb-1">Department</label>
              <select
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
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
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.code}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Section</label>
              <select
                value={formData.sectionId}
                onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
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
              Create Student
            </button>
          </div>
        </form>
      </Modal>

      {/* CSV Import Modal */}
      <Modal isOpen={showImportModal} onClose={() => setShowImportModal(false)} title="Bulk Import Students via CSV">
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Paste CSV format: <code className="bg-slate-100 p-1 rounded">studentId, rollNumber, name, email, departmentCode, sectionName</code>
          </p>

          <textarea
            rows={6}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder={`studentId,rollNumber,name,email,departmentCode,sectionName\nSTU-100,21A51,Rajesh Kumar,rajesh@campusattend.local,CSE,CSE-A`}
            className="w-full p-3 font-mono bg-slate-900 text-slate-100 rounded-xl text-xs focus:outline-none"
          ></textarea>

          <div className="flex gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowImportModal(false)}
              className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleBulkImport}
              disabled={importing}
              className="flex-1 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 shadow-md"
            >
              {importing ? 'Importing...' : 'Process Import'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
