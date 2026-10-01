import React, { useEffect, useState } from 'react';
import { fetchApi } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import Modal from '../../components/common/Modal';
import { TableSkeleton } from '../../components/common/Skeleton';
import { CalendarCheck, Plus } from 'lucide-react';

export default function ManageAssignmentsPage() {
  const [faculty, setFaculty] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const [facultyId, setFacultyId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [academicYear, setAcademicYear] = useState('2025-2026');

  const { showSuccess, showError } = useNotification();

  const loadData = async () => {
    try {
      const [fRes, subRes, secRes] = await Promise.all([
        fetchApi('/admin/faculty'),
        fetchApi('/admin/subjects'),
        fetchApi('/admin/sections'),
      ]);
      if (fRes.success) setFaculty(fRes.data);
      if (subRes.success) setSubjects(subRes.data);
      if (secRes.success) setSections(secRes.data);
    } catch (err) {
      console.error('Failed to load assignments data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchApi('/admin/assign-faculty', {
        method: 'POST',
        body: JSON.stringify({ facultyId, subjectId, sectionId, academicYear }),
      });
      if (res.success) {
        showSuccess('Faculty assigned to subject & section successfully.');
        setShowAssignModal(false);
        loadData();
      }
    } catch (err) {
      showError(err.message || 'Faculty assignment already exists for this class.');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Faculty Subject Assignments</h1>
          <p className="text-xs text-slate-500">Map teaching faculty members to subjects and section classes.</p>
        </div>

        <button
          onClick={() => {
            if (faculty.length > 0) setFacultyId(faculty[0].id);
            if (subjects.length > 0) setSubjectId(subjects[0].id);
            if (sections.length > 0) setSectionId(sections[0].id);
            setShowAssignModal(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Faculty Assignment</span>
        </button>
      </div>

      {loading ? (
        <TableSkeleton rows={6} cols={4} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Faculty Member</th>
                <th className="py-3.5 px-4">Subject</th>
                <th className="py-3.5 px-4">Section</th>
                <th className="py-3.5 px-4">Academic Year</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {faculty.flatMap((f) =>
                (f.facultyAssignments || []).map((ass) => (
                  <tr key={ass.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{f.name} ({f.employeeId})</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900">{ass.subject?.name}</span> ({ass.subject?.code})
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">Section {ass.section?.name}</td>
                    <td className="py-3.5 px-4 text-slate-500">{ass.academicYear}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Assign Modal */}
      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Assign Faculty to Subject & Section">
        <form onSubmit={handleAssign} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Select Faculty Member</label>
            <select
              value={facultyId}
              onChange={(e) => setFacultyId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            >
              {faculty.map((f) => (
                <option key={f.id} value={f.id}>{f.name} ({f.department?.code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Select Subject</label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Select Target Section</label>
            <select
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            >
              {sections.map((sec) => (
                <option key={sec.id} value={sec.id}>Section {sec.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAssignModal(false)}
              className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-500 shadow-md"
            >
              Confirm Assignment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
