const prisma = require('../config/db');

const getStudentDashboard = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user.id },
      include: {
        department: true,
        course: true,
        section: true,
        attendanceRecords: {
          include: {
            session: {
              include: {
                subject: true,
                faculty: true,
              },
            },
          },
        },
      },
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const records = student.attendanceRecords;
    const totalClasses = records.length;
    const presentClasses = records.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').length;
    const absentClasses = records.filter((r) => r.status === 'ABSENT').length;
    const excusedClasses = records.filter((r) => r.status === 'EXCUSED').length;

    const overallPercentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;
    const isShortage = overallPercentage < 75;
    const shortageMargin = isShortage ? 75 - overallPercentage : 0;

    // Subject-wise grouping
    const subjectMap = {};

    records.forEach((record) => {
      const subj = record.session.subject;
      if (!subjectMap[subj.id]) {
        subjectMap[subj.id] = {
          id: subj.id,
          code: subj.code,
          name: subj.name,
          credits: subj.credits,
          facultyName: record.session.faculty.name,
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
        };
      }

      subjectMap[subj.id].total++;
      if (record.status === 'PRESENT') subjectMap[subj.id].present++;
      else if (record.status === 'LATE') {
        subjectMap[subj.id].present++;
        subjectMap[subj.id].late++;
      } else if (record.status === 'ABSENT') subjectMap[subj.id].absent++;
      else if (record.status === 'EXCUSED') subjectMap[subj.id].excused++;
    });

    const subjectsSummary = Object.values(subjectMap).map((sub) => ({
      ...sub,
      percentage: sub.total > 0 ? Math.round((sub.present / sub.total) * 100) : 0,
      isShortage: sub.total > 0 && Math.round((sub.present / sub.total) * 100) < 75,
    }));

    // Monthly breakdown for line charts
    const monthlyMap = {};
    records.forEach((r) => {
      const monthStr = r.session.date.substring(0, 7); // YYYY-MM
      if (!monthlyMap[monthStr]) {
        monthlyMap[monthStr] = { month: monthStr, total: 0, present: 0 };
      }
      monthlyMap[monthStr].total++;
      if (r.status === 'PRESENT' || r.status === 'LATE') monthlyMap[monthStr].present++;
    });

    const monthlyTrend = Object.values(monthlyMap)
      .sort((a, b) => a.month.localeCompare(b.month))
      .map((m) => ({
        month: m.month,
        percentage: m.total > 0 ? Math.round((m.present / m.total) * 100) : 0,
      }));

    // Student Timetable
    const timetable = await prisma.timetable.findMany({
      where: { sectionId: student.sectionId },
      include: {
        subject: true,
        faculty: true,
      },
      orderBy: { startTime: 'asc' },
    });

    // In-app notifications
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: {
        studentInfo: {
          id: student.id,
          studentId: student.studentId,
          rollNumber: student.rollNumber,
          name: student.name,
          email: student.email,
          phone: student.phone,
          department: student.department.name,
          departmentCode: student.department.code,
          course: student.course.name,
          section: student.section.name,
          year: student.year,
          semester: student.semester,
          academicYear: student.academicYear,
        },
        summary: {
          totalClasses,
          presentClasses,
          absentClasses,
          excusedClasses,
          overallPercentage,
          isShortage,
          shortageMargin,
          requiredPercentage: 75,
        },
        subjects: subjectsSummary,
        monthlyTrend,
        timetable,
        notifications,
      },
    });
  } catch (error) {
    console.error('Error fetching student dashboard:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch student dashboard data.' });
  }
};

const getStudentAttendanceHistory = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user.id },
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const { subjectId, status, startDate, endDate } = req.query;

    const where = { studentId: student.id };

    if (status) where.status = status;

    if (subjectId || startDate || endDate) {
      where.session = {};
      if (subjectId) where.session.subjectId = subjectId;
      if (startDate || endDate) {
        where.session.date = {};
        if (startDate) where.session.date.gte = startDate;
        if (endDate) where.session.date.lte = endDate;
      }
    }

    const records = await prisma.attendanceRecord.findMany({
      where,
      orderBy: { markedAt: 'desc' },
      include: {
        session: {
          include: {
            subject: true,
            faculty: true,
            section: true,
          },
        },
      },
    });

    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch attendance history.' });
  }
};

module.exports = {
  getStudentDashboard,
  getStudentAttendanceHistory,
};
