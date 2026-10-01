import React, { useEffect, useState } from 'react';
import { fetchApi } from '../../services/api';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { TableSkeleton } from '../../components/common/Skeleton';
import { Eye, Edit, ShieldCheck } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';

export default function AdminAttendancePage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);

  const [editingRecord, setEditingRecord] = useState(null);
  const [editStatus, setEditStatus] = useState('PRESENT');
  const [editRemarks, setEditRemarks] = useState('');
  const [editReason, setEditReason] = useState('');
  const [updating, setUpdating] = useState(false);

  const { showSuccess, showError } = useNotification();

  const loadSessions = async () => {
    try {
      const res = await fetchApi('/attendance/history');
      if (res.success) setSessions(res.data);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleViewSession = async (sessionId) => {
    try {
      const res = await fetchApi(`/attendance/session/${sessionId}`);
      if (res.success) setSelectedSession(res.data);
    } catch (err) {
      showError('Failed to load session details.');
    }
  };

  const handleSaveCorrection = async () => {
    if (!editReason || editReason.trim().length < 3) {
      showError('Please enter a valid reason for attendance correction.');
      return;
    }

    setUpdating(true);
    try {
      const res = await fetchApi(`/attendance/records/${editingRecord.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: editStatus,
          remarks: editRemarks || null,
          reason: editReason,
        }),
      });

      if (res.success) {
        showSuccess('Attendance record updated with admin audit log.');
        setEditingRecord(null);
        if (selectedSession) handleViewSession(selectedSession.id);
        loadSessions();
      }
    } catch (err) {
      showError(err.message || 'Failed to update attendance record.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">College Attendance Sessions</h1>
        <p className="text-xs text-slate-500">Monitor all college attendance sessions and make authorized corrections with audit tracking.</p>
      </div>

      {loading ? (
        <TableSkeleton rows={8} cols={6} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Date & Hour</th>
                <th className="py-3.5 px-4">Subject</th>
                <th className="py-3.5 px-4">Section</th>
                <th className="py-3.5 px-4">Faculty</th>
                <th className="py-3.5 px-4">Present / Total</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {sessions.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{s.date} (H{s.hour})</td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{s.subject}</div>
                    <div className="text-[10px] text-slate-400">{s.subjectCode}</div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">{s.section}</td>
                  <td className="py-3.5 px-4">{s.faculty}</td>
                  <td className="py-3.5 px-4">
                    <span className="text-emerald-700 font-bold">{s.present}</span> / {s.total}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleViewSession(s.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                    >
                      Inspect Records
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View Session Modal */}
      <Modal
        isOpen={!!selectedSession}
        onClose={() => setSelectedSession(null)}
        title={`Session: ${selectedSession?.subject?.name} (${selectedSession?.date})`}
        maxWidth="max-w-4xl"
      >
        {selectedSession && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-4 gap-2 font-medium">
              <div>Faculty: <strong className="text-slate-900">{selectedSession.faculty?.name}</strong></div>
              <div>Section: <strong className="text-slate-900">{selectedSession.section?.name}</strong></div>
              <div>Date: <strong className="text-slate-900">{selectedSession.date}</strong></div>
              <div>Hour: <strong className="text-slate-900">{selectedSession.hour}</strong></div>
            </div>

            <div className="max-h-96 overflow-y-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-100 text-[10px] uppercase font-bold text-slate-500">
                    <th className="py-2.5 px-3">Roll No</th>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Edit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedSession.records.map((r) => (
                    <tr key={r.id}>
                      <td className="py-2.5 px-3 font-bold">{r.student.rollNumber}</td>
                      <td className="py-2.5 px-3">{r.student.name}</td>
                      <td className="py-2.5 px-3">
                        <Badge variant={r.status === 'PRESENT' ? 'emerald' : r.status === 'ABSENT' ? 'rose' : 'amber'}>
                          {r.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => {
                            setEditingRecord(r);
                            setEditStatus(r.status);
                            setEditRemarks(r.remarks || '');
                            setEditReason('');
                          }}
                          className="p-1 rounded bg-slate-100 hover:bg-slate-200"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Record Modal */}
      <Modal isOpen={!!editingRecord} onClose={() => setEditingRecord(null)} title="Admin Attendance Record Correction">
        {editingRecord && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <p>Student: <strong>{editingRecord.student?.name}</strong> ({editingRecord.student?.rollNumber})</p>
            </div>

            <div>
              <label className="block font-semibold mb-1">New Status</label>
              <div className="grid grid-cols-4 gap-2">
                {['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setEditStatus(st)}
                    className={`py-2 font-bold rounded-xl border ${
                      editStatus === st ? 'bg-primary-600 text-white' : 'bg-white text-slate-700'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">Audit Log Correction Reason *</label>
              <textarea
                required
                rows={2}
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                placeholder="Reason for administrative override..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              ></textarea>
            </div>

            <div className="flex gap-3 pt-3 border-t border-slate-100">
              <button onClick={() => setEditingRecord(null)} className="flex-1 py-2.5 bg-slate-100 font-bold rounded-xl">
                Cancel
              </button>
              <button onClick={handleSaveCorrection} disabled={updating} className="flex-1 py-2.5 bg-primary-600 text-white font-bold rounded-xl">
                {updating ? 'Saving...' : 'Apply Correction'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
