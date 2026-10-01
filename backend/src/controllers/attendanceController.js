const prisma = require('../config/db');
const { createAuditLog } = require('../utils/audit');

// Record Attendance Session
const createAttendanceSession = async (req, res) => {
  try {
    const { subjectId, sectionId, date, hour, topic, records } = req.body;

    // Get faculty profile ID if faculty user
    let facultyId = req.user.facultyProfile?.id;
    if (!facultyId && req.user.role === 'ADMIN') {
      // Find faculty assigned to this subject/section or take first faculty
      const assignment = await prisma.facultySubject.findFirst({
        where: { subjectId, sectionId },
      });
      if (assignment) {
        facultyId = assignment.facultyId;
      } else {
        const anyFaculty = await prisma.faculty.findFirst();
        facultyId = anyFaculty ? anyFaculty.id : null;
      }
    }

    if (!facultyId) {
      return res.status(400).json({ success: false, message: 'Faculty profile not found for this user.' });
    }

    // Check duplicate session
    const existingSession = await prisma.attendanceSession.findUnique({
      where: {
        subjectId_sectionId_date_hour: {
          subjectId,
          sectionId,
          date,
          hour,
        },
      },
    });

    if (existingSession) {
      return res.status(400).json({
        success: false,
        message: 'Attendance has already been recorded for this class session (same subject, section, date, and hour).',
        sessionId: existingSession.id,
      });
    }

    // Execute session & records creation in transaction
    const result = await prisma.$transaction(async (tx) => {
      const session = await tx.attendanceSession.create({
        data: {
          subjectId,
          sectionId,
          facultyId,
          date,
          hour,
          topic: topic || 'Regular Lecture',
          status: 'SUBMITTED',
        },
      });

      const recordsData = records.map((r) => ({
        sessionId: session.id,
        studentId: r.studentId,
        status: r.status,
        markedBy: req.user.id,
        remarks: r.remarks || null,
      }));

      await tx.attendanceRecord.createMany({
        data: recordsData,
      });

      return session;
    });

    // Audit log
    await createAuditLog({
      userId: req.user.id,
      action: 'ATTENDANCE_SESSION_CREATED',
      entity: 'AttendanceSession',
      entityId: result.id,
      newValue: { subjectId, sectionId, date, hour, totalRecords: records.length },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Attendance recorded and submitted successfully.',
      data: { sessionId: result.id },
    });
  } catch (error) {
    console.error('Error creating attendance session:', error);
    res.status(500).json({ success: false, message: 'Failed to record attendance.' });
  }
};

// Get Session Details with Student Records
const getAttendanceSession = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await prisma.attendanceSession.findUnique({
      where: { id },
      include: {
        subject: true,
        section: { include: { course: true } },
        faculty: true,
        records: {
          include: {
            student: true,
          },
          orderBy: {
            student: { rollNumber: 'asc' },
          },
        },
      },
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Attendance session not found.' });
    }

    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch attendance session.' });
  }
};

// Update an Attendance Record with mandatory reason & audit logging
const updateAttendanceRecord = async (req, res) => {
  try {
    const { id } = req.params; // recordId
    const { status, remarks, reason } = req.body;

    if (!reason || reason.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'A valid reason for attendance correction is required.' });
    }

    const existingRecord = await prisma.attendanceRecord.findUnique({
      where: { id },
      include: {
        student: true,
        session: {
          include: { subject: true, section: true },
        },
      },
    });

    if (!existingRecord) {
      return res.status(404).json({ success: false, message: 'Attendance record not found.' });
    }

    const updatedRecord = await prisma.attendanceRecord.update({
      where: { id },
      data: {
        status,
        remarks: remarks !== undefined ? remarks : existingRecord.remarks,
        markedBy: req.user.id,
      },
    });

    // Create Audit Log
    await createAuditLog({
      userId: req.user.id,
      action: 'ATTENDANCE_RECORD_UPDATED',
      entity: 'AttendanceRecord',
      entityId: id,
      oldValue: {
        status: existingRecord.status,
        remarks: existingRecord.remarks,
        studentName: existingRecord.student.name,
        rollNumber: existingRecord.student.rollNumber,
      },
      newValue: {
        status,
        remarks,
        reason,
        correctedBy: req.user.name,
      },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Attendance record updated successfully with audit trail.',
      data: updatedRecord,
    });
  } catch (error) {
    console.error('Error updating attendance record:', error);
    res.status(500).json({ success: false, message: 'Failed to update attendance record.' });
  }
};

// Get Session History
const getAttendanceHistory = async (req, res) => {
  try {
    const { subjectId, sectionId, date, startDate, endDate, facultyId } = req.query;

    const where = {};
    if (subjectId) where.subjectId = subjectId;
    if (sectionId) where.sectionId = sectionId;
    if (facultyId) where.facultyId = facultyId;
    if (date) where.date = date;
    else if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    // Restrict faculty to their own sessions unless admin
    if (req.user.role === 'FACULTY' && req.user.facultyProfile) {
      where.facultyId = req.user.facultyProfile.id;
    }

    const sessions = await prisma.attendanceSession.findMany({
      where,
      orderBy: [{ date: 'desc' }, { hour: 'desc' }],
      include: {
        subject: true,
        section: true,
        faculty: true,
        records: true,
      },
    });

    const summary = sessions.map((s) => {
      const total = s.records.length;
      const present = s.records.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').length;
      const absent = s.records.filter((r) => r.status === 'ABSENT').length;
      const late = s.records.filter((r) => r.status === 'LATE').length;
      const excused = s.records.filter((r) => r.status === 'EXCUSED').length;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

      return {
        id: s.id,
        date: s.date,
        hour: s.hour,
        topic: s.topic,
        subject: s.subject.name,
        subjectCode: s.subject.code,
        section: s.section.name,
        faculty: s.faculty.name,
        total,
        present,
        absent,
        late,
        excused,
        percentage,
      };
    });

    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch attendance history.' });
  }
};

module.exports = {
  createAttendanceSession,
  getAttendanceSession,
  updateAttendanceRecord,
  getAttendanceHistory,
};
