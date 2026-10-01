import React, { useEffect, useState } from 'react';
import { fetchApi } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/Skeleton';
import { Clock, Eye, Edit, ShieldCheck, CheckCircle2, Search } from 'lucide-react';

export default function FacultyHistoryPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);

  const [editStatus, setEditStatus] = useState('PRESENT');
  const [editRemarks, setEditRemarks] = useState('');
  const [editReason, setEditReason] = useState('');
  const [updating, setUpdating] = useState(false);

  const { showSuccess, showError } = useNotification();

  const fetchHistory = async () => {
    try {
      const res = await fetchApi('/attendance/history');
      if (res.success) setSessions(res.data);
    } catch (err) {
      console.error('Failed to fetch attendance history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleViewSession = async (sessionId) => {
    try {
      const res = await fetchApi(`/attendance/session/${sessionId}`);
      if (res.success) setSelectedSession(res.data);
    } catch (err) {
      showError('Failed to fetch session details.');
    }
  };

  const openEditModal = (record) => {
    setEditingRecord(record);
    setEditStatus(record.status);
    setEditRemarks(record.remarks || '');
    setEditReason('');
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
        showSuccess('Attendance record updated with audit log.');
        setEditingRecord(null);
        if (selectedSession) {
          handleViewSession(selectedSession.id);
        }
        fetchHistory();
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
        <h1 className="text-2xl font-bold text-slate-900">Attendance Session History</h1>
        <p className="text-xs text-slate-500">Past classes recorded, attendance logs, and authorized corrections.</p>
      </div>

      {loading ? (
        <TableSkeleton rows={8} cols={6} />
      ) : sessions.length === 0 ? (
        <EmptyState title="No attendance history found" description="You have not submitted any class attendance sessions yet." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Date & Hour</th>
                  <th className="py-3.5 px-4">Subject</th>
                  <th className="py-3.5 px-4">Section</th>
                  <th className="py-3.5 px-4">Present / Total</th>
                  <th className="py-3.5 px-4">Percentage</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {sessions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{s.date}</div>
                      <div className="text-[10px] text-slate-500">Hour {s.hour}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{s.subject}</div>
                      <div className="text-[10px] text-slate-500">{s.subjectCode}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{s.section}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-emerald-700 font-bold">{s.present}</span> / {s.total}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={s.percentage >= 75 ? 'emerald' : 'rose'}>{s.percentage}%</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleViewSession(s.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Class Records</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Session Details Modal */}
      <Modal
        isOpen={!!selectedSession}
        onClose={() => setSelectedSession(null)}
        title={`Session Details: ${selectedSession?.subject?.name} (${selectedSession?.date})`}
        maxWidth="max-w-4xl"
      >
        {selectedSession && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-700 font-medium">
              <div>Subject: <strong className="text-slate-900">{selectedSession.subject.code}</strong></div>
              <div>Section: <strong className="text-slate-900">{selectedSession.section.name}</strong></div>
              <div>Date: <strong className="text-slate-900">{selectedSession.date}</strong></div>
              <div>Hour: <strong className="text-slate-900">{selectedSession.hour}</strong></div>
            </div>

            <h4 className="font-bold text-slate-900 text-sm pt-2">Student Attendance List</h4>
            <div className="max-h-96 overflow-y-auto custom-scrollbar border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-[10px] uppercase font-bold text-slate-500">
                    <th className="py-2.5 px-3">Roll No</th>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Remarks</th>
                    <th className="py-2.5 px-3 text-right">Edit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedSession.records.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold">{r.student.rollNumber}</td>
                      <td className="py-2.5 px-3">{r.student.name}</td>
                      <td className="py-2.5 px-3">
                        <Badge
                          variant={
                            r.status === 'PRESENT'
                              ? 'emerald'
                              : r.status === 'ABSENT'
                              ? 'rose'
                              : r.status === 'LATE'
                              ? 'amber'
                              : 'indigo'
                          }
                        >
                          {r.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">{r.remarks || '-'}</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => openEditModal(r)}
                          className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
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

      {/* Edit Single Record Modal */}
      <Modal
        isOpen={!!editingRecord}
        onClose={() => setEditingRecord(null)}
        title="Edit Student Attendance Record"
      >
        {editingRecord && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <p>Student: <strong className="text-slate-900">{editingRecord.student?.name}</strong> ({editingRecord.student?.rollNumber})</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Current Status: <strong>{editingRecord.status}</strong></p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">New Status</label>
              <div className="grid grid-cols-4 gap-2">
                {['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setEditStatus(st)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      editStatus === st
                        ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks</label>
              <input
                type="text"
                value={editRemarks}
                onChange={(e) => setEditRemarks(e.target.value)}
                placeholder="Optional remarks"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Correction <span className="text-rose-500">* (Logged in Audit Log)</span>
              </label>
              <textarea
                required
                rows={2}
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                placeholder="e.g. Student submitted medical leave approval document"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              ></textarea>
            </div>

            <div className="flex gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCorrection}
                disabled={updating}
                className="flex-1 py-2.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-500 shadow-md cursor-pointer"
              >
                {updating ? 'Saving...' : 'Save Correction'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
