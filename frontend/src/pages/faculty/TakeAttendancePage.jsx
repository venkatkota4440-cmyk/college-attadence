import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { fetchApi } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/Skeleton';
import { CheckCircle2, XCircle, Clock, AlertCircle, BookOpen, Users, Calendar, ArrowRight, Check, RefreshCw } from 'lucide-react';

export default function TakeAttendancePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const [assignedClasses, setAssignedClasses] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(searchParams.get('subjectId') || '');
  const [selectedSectionId, setSelectedSectionId] = useState(searchParams.get('sectionId') || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [hour, setHour] = useState(1);
  const [topic, setTopic] = useState('');

  const [students, setStudents] = useState([]);
  const [recordsMap, setRecordsMap] = useState({}); // { studentId: { status: 'PRESENT'|'ABSENT'|'LATE'|'EXCUSED', remarks: '' } }
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // 1. Fetch Assigned Classes for dropdowns
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetchApi('/faculty/assigned-classes');
        if (res.success) {
          setAssignedClasses(res.data);
          if (!selectedSubjectId && res.data.length > 0) {
            setSelectedSubjectId(res.data[0].subjectId);
            setSelectedSectionId(res.data[0].sectionId);
          }
        }
      } catch (err) {
        console.error('Failed to load faculty assigned classes:', err);
      }
    };
    fetchClasses();
  }, []);

  // 2. Fetch Students when sectionId changes
  useEffect(() => {
    if (!selectedSectionId) return;

    const fetchStudents = async () => {
      setLoadingStudents(true);
      try {
        const res = await fetchApi(`/faculty/enrolled-students?sectionId=${selectedSectionId}`);
        if (res.success) {
          setStudents(res.data);
          // Default all students to PRESENT out of the box
          const initialMap = {};
          res.data.forEach((s) => {
            initialMap[s.id] = { status: 'PRESENT', remarks: '' };
          });
          setRecordsMap(initialMap);
        }
      } catch (err) {
        showError('Failed to load enrolled students.');
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [selectedSectionId]);

  const handleStatusChange = (studentId, status) => {
    setRecordsMap((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));
  };

  const handleRemarksChange = (studentId, remarks) => {
    setRecordsMap((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], remarks },
    }));
  };

  const markAll = (status) => {
    const updated = {};
    students.forEach((s) => {
      updated[s.id] = { status, remarks: recordsMap[s.id]?.remarks || '' };
    });
    setRecordsMap(updated);
  };

  // Stats calculation
  const totalStudents = students.length;
  const presentCount = Object.values(recordsMap).filter((r) => r.status === 'PRESENT').length;
  const absentCount = Object.values(recordsMap).filter((r) => r.status === 'ABSENT').length;
  const lateCount = Object.values(recordsMap).filter((r) => r.status === 'LATE').length;
  const excusedCount = Object.values(recordsMap).filter((r) => r.status === 'EXCUSED').length;

  const handleSubmit = async () => {
    if (!selectedSubjectId || !selectedSectionId) {
      showError('Please select both subject and section.');
      return;
    }

    if (totalStudents === 0) {
      showError('No students found to mark attendance.');
      return;
    }

    setSubmitting(true);
    try {
      const recordsArray = Object.keys(recordsMap).map((studentId) => ({
        studentId,
        status: recordsMap[studentId].status,
        remarks: recordsMap[studentId].remarks || null,
      }));

      const payload = {
        subjectId: selectedSubjectId,
        sectionId: selectedSectionId,
        date,
        hour: Number(hour),
        topic: topic || 'Regular Lecture',
        records: recordsArray,
      };

      const res = await fetchApi('/attendance/session', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.success) {
        showSuccess('Attendance saved and submitted successfully!');
        setShowReviewModal(false);
        navigate('/faculty/history');
      }
    } catch (err) {
      showError(err.message || 'Failed to record attendance.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Take Class Attendance</h1>
          <p className="text-xs text-slate-500">Select class details, mark student status, review, and submit.</p>
        </div>

        {/* Quick Review & Submit Trigger */}
        <button
          onClick={() => setShowReviewModal(true)}
          disabled={totalStudents === 0}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-sm shadow-md shadow-primary-900/30 transition-all cursor-pointer disabled:opacity-50"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>Review & Submit</span>
        </button>
      </div>

      {/* Class Selection Form Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Subject</label>
          <select
            value={selectedSubjectId}
            onChange={(e) => {
              setSelectedSubjectId(e.target.value);
              const matchingAss = assignedClasses.find((a) => a.subjectId === e.target.value);
              if (matchingAss) setSelectedSectionId(matchingAss.sectionId);
            }}
            className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {assignedClasses.map((ass) => (
              <option key={ass.id} value={ass.subjectId}>
                {ass.subject.name} ({ass.subject.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Section</label>
          <select
            value={selectedSectionId}
            onChange={(e) => setSelectedSectionId(e.target.value)}
            className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {assignedClasses.map((ass) => (
              <option key={ass.id} value={ass.sectionId}>
                Section {ass.section.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Hour / Period</label>
          <select
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {[1, 2, 3, 4, 5, 6, 7].map((h) => (
              <option key={h} value={h}>
                Hour {h}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Lecture Topic (Optional)</label>
          <input
            type="text"
            placeholder="e.g. Unit 3 - B-Trees"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Summary Live Counter & Batch Actions Bar */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 shadow-md">
        <div className="flex items-center gap-6 text-xs font-semibold">
          <div>
            Total: <span className="font-extrabold text-white text-sm">{totalStudents}</span>
          </div>
          <div className="text-emerald-400">
            Present: <span className="font-extrabold text-sm">{presentCount}</span>
          </div>
          <div className="text-rose-400">
            Absent: <span className="font-extrabold text-sm">{absentCount}</span>
          </div>
          <div className="text-amber-400">
            Late: <span className="font-extrabold text-sm">{lateCount}</span>
          </div>
          <div className="text-indigo-400">
            Excused: <span className="font-extrabold text-sm">{excusedCount}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => markAll('PRESENT')}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Mark All Present
          </button>
          <button
            type="button"
            onClick={() => markAll('ABSENT')}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Mark All Absent
          </button>
        </div>
      </div>

      {/* Student List & Marking Grid */}
      {loadingStudents ? (
        <TableSkeleton rows={10} cols={4} />
      ) : students.length === 0 ? (
        <EmptyState title="No enrolled students found" description="Select a section with enrolled students to take attendance." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-16">Roll No</th>
                  <th className="py-3.5 px-4">Student Name</th>
                  <th className="py-3.5 px-4 text-center">Attendance Status</th>
                  <th className="py-3.5 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {students.map((student) => {
                  const currentStatus = recordsMap[student.id]?.status || 'PRESENT';

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{student.rollNumber}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{student.name}</div>
                        <div className="text-[10px] text-slate-400">{student.studentId}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'PRESENT')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              currentStatus === 'PRESENT'
                                ? 'bg-emerald-600 text-white shadow-md'
                                : 'bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-700'
                            }`}
                          >
                            PRESENT
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'ABSENT')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              currentStatus === 'ABSENT'
                                ? 'bg-rose-600 text-white shadow-md'
                                : 'bg-slate-100 text-slate-600 hover:bg-rose-100 hover:text-rose-700'
                            }`}
                          >
                            ABSENT
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'LATE')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              currentStatus === 'LATE'
                                ? 'bg-amber-500 text-white shadow-md'
                                : 'bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-700'
                            }`}
                          >
                            LATE
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'EXCUSED')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              currentStatus === 'EXCUSED'
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-slate-100 text-slate-600 hover:bg-indigo-100 hover:text-indigo-700'
                            }`}
                          >
                            EXCUSED
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <input
                          type="text"
                          placeholder="Optional remarks"
                          value={recordsMap[student.id]?.remarks || ''}
                          onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                          className="w-full text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Review Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title="Review Attendance Submission"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <p>Date: <strong className="text-slate-900">{date}</strong> &bull; Hour: <strong className="text-slate-900">{hour}</strong></p>
            <p>Topic: <strong className="text-slate-900">{topic || 'Regular Lecture'}</strong></p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800">
              <span className="text-xl font-extrabold">{presentCount}</span>
              <p className="text-[10px] uppercase font-bold mt-1">Present Students</p>
            </div>
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-800">
              <span className="text-xl font-extrabold">{absentCount}</span>
              <p className="text-[10px] uppercase font-bold mt-1">Absent Students</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800">
              <span className="text-xl font-extrabold">{lateCount}</span>
              <p className="text-[10px] uppercase font-bold mt-1">Late Students</p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200 text-indigo-800">
              <span className="text-xl font-extrabold">{excusedCount}</span>
              <p className="text-[10px] uppercase font-bold mt-1">Excused Students</p>
            </div>
          </div>

          <p className="text-slate-500 text-[11px] text-center pt-2">
            Confirm submitting attendance for total <strong className="text-slate-800">{totalStudents}</strong> students.
          </p>

          <div className="flex gap-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => setShowReviewModal(false)}
              className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
            >
              Back to Edit
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-2.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-500 shadow-md transition-colors cursor-pointer"
            >
              {submitting ? 'Saving...' : 'Confirm & Submit'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
