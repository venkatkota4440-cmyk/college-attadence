const prisma = require('../config/db');

const getSectionReport = async (req, res) => {
  try {
    const { sectionId } = req.params;

    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: {
        course: true,
        students: {
          where: { isActive: true },
          orderBy: { rollNumber: 'asc' },
          include: {
            attendanceRecords: {
              include: {
                session: {
                  include: { subject: true },
                },
              },
            },
          },
        },
      },
    });

    if (!section) {
      return res.status(404).json({ success: false, message: 'Section not found.' });
    }

    const studentsReport = section.students.map((st) => {
      const total = st.attendanceRecords.length;
      const present = st.attendanceRecords.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').length;
      const absent = st.attendanceRecords.filter((r) => r.status === 'ABSENT').length;
      const late = st.attendanceRecords.filter((r) => r.status === 'LATE').length;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

      return {
        id: st.id,
        rollNumber: st.rollNumber,
        studentId: st.studentId,
        name: st.name,
        email: st.email,
        totalClasses: total,
        presentClasses: present,
        absentClasses: absent,
        lateClasses: late,
        percentage,
        isShortage: percentage < 75,
      };
    });

    const totalStudents = studentsReport.length;
    const shortageCount = studentsReport.filter((s) => s.isShortage).length;
    const avgPercentage = totalStudents > 0 
      ? Math.round(studentsReport.reduce((acc, s) => acc + s.percentage, 0) / totalStudents) 
      : 0;

    res.json({
      success: true,
      data: {
        sectionInfo: {
          id: section.id,
          name: section.name,
          course: section.course.name,
          year: section.year,
          semester: section.semester,
          academicYear: section.academicYear,
        },
        summary: {
          totalStudents,
          shortageCount,
          avgPercentage,
        },
        students: studentsReport,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate section report.' });
  }
};

const getSubjectReport = async (req, res) => {
  try {
    const { subjectId } = req.params;

    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        department: true,
        course: true,
        attendanceSessions: {
          include: {
            section: true,
            records: true,
          },
        },
      },
    });

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found.' });
    }

    const totalSessions = subject.attendanceSessions.length;
    let totalRecords = 0;
    let presentRecords = 0;

    subject.attendanceSessions.forEach((s) => {
      s.records.forEach((r) => {
        totalRecords++;
        if (r.status === 'PRESENT' || r.status === 'LATE') presentRecords++;
      });
    });

    const avgAttendance = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0;

    res.json({
      success: true,
      data: {
        subjectInfo: {
          id: subject.id,
          name: subject.name,
          code: subject.code,
          credits: subject.credits,
          department: subject.department.name,
        },
        summary: {
          totalSessions,
          totalRecords,
          avgAttendance,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate subject report.' });
  }
};

const getStudentReport = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await prisma.student.findUnique({
      where: { id: studentId },
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
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const records = student.attendanceRecords;
    const total = records.length;
    const present = records.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').length;
    const absent = records.filter((r) => r.status === 'ABSENT').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    res.json({
      success: true,
      data: {
        student,
        summary: {
          total,
          present,
          absent,
          percentage,
          isShortage: percentage < 75,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate student report.' });
  }
};

module.exports = {
  getSectionReport,
  getSubjectReport,
  getStudentReport,
};
