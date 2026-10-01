const prisma = require('../config/db');

const getFacultyDashboard = async (req, res) => {
  try {
    const faculty = await prisma.faculty.findUnique({
      where: { userId: req.user.id },
      include: {
        department: true,
        facultyAssignments: {
          include: {
            subject: true,
            section: {
              include: { course: true },
            },
          },
        },
      },
    });

    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty profile not found.' });
    }

    // Recent sessions conducted by this faculty
    const recentSessions = await prisma.attendanceSession.findMany({
      where: { facultyId: faculty.id },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        subject: true,
        section: true,
        records: true,
      },
    });

    const sessionsSummary = recentSessions.map((session) => {
      const total = session.records.length;
      const present = session.records.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').length;
      const absent = session.records.filter((r) => r.status === 'ABSENT').length;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

      return {
        id: session.id,
        date: session.date,
        hour: session.hour,
        subject: session.subject.name,
        subjectCode: session.subject.code,
        section: session.section.name,
        topic: session.topic,
        totalStudents: total,
        present,
        absent,
        percentage,
      };
    });

    res.json({
      success: true,
      data: {
        facultyInfo: {
          id: faculty.id,
          name: faculty.name,
          employeeId: faculty.employeeId,
          designation: faculty.designation,
          department: faculty.department.name,
        },
        assignments: faculty.facultyAssignments,
        recentSessions: sessionsSummary,
      },
    });
  } catch (error) {
    console.error('Error fetching faculty dashboard:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch faculty dashboard data.' });
  }
};

const getAssignedClasses = async (req, res) => {
  try {
    const faculty = await prisma.faculty.findUnique({
      where: { userId: req.user.id },
    });

    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty profile not found.' });
    }

    const assignments = await prisma.facultySubject.findMany({
      where: { facultyId: faculty.id },
      include: {
        subject: true,
        section: {
          include: { course: true },
        },
      },
    });

    res.json({ success: true, data: assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch assigned classes.' });
  }
};

const getEnrolledStudents = async (req, res) => {
  try {
    const { sectionId } = req.query;
    if (!sectionId) {
      return res.status(400).json({ success: false, message: 'sectionId query parameter is required.' });
    }

    const students = await prisma.student.findMany({
      where: { sectionId, isActive: true },
      orderBy: { rollNumber: 'asc' },
      select: {
        id: true,
        studentId: true,
        rollNumber: true,
        name: true,
        email: true,
      },
    });

    res.json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch section students.' });
  }
};

module.exports = {
  getFacultyDashboard,
  getAssignedClasses,
  getEnrolledStudents,
};
