const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const { createAuditLog } = require('../utils/audit');

// 1. ADMIN DASHBOARD STATS
const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await prisma.student.count({ where: { isActive: true } });
    const totalFaculty = await prisma.faculty.count({ where: { isActive: true } });
    const totalDepartments = await prisma.department.count();
    const totalSubjects = await prisma.subject.count();

    const todayStr = new Date().toISOString().split('T')[0];
    const todaySessions = await prisma.attendanceSession.findMany({
      where: { date: todayStr },
      include: { records: true },
    });

    let totalClassesToday = todaySessions.length;
    let totalPresentToday = 0;
    let totalRecordsToday = 0;

    todaySessions.forEach((session) => {
      session.records.forEach((record) => {
        totalRecordsToday++;
        if (record.status === 'PRESENT' || record.status === 'LATE') {
          totalPresentToday++;
        }
      });
    });

    const todayAttendancePercentage = totalRecordsToday > 0 
      ? Math.round((totalPresentToday / totalRecordsToday) * 100) 
      : 0;

    // Calculate students with shortage (< 75%)
    const allStudents = await prisma.student.findMany({
      where: { isActive: true },
      include: {
        attendanceRecords: true,
        department: true,
        section: true,
      },
    });

    let studentsBelowThresholdCount = 0;
    const shortageStudents = [];

    allStudents.forEach((student) => {
      const total = student.attendanceRecords.length;
      if (total === 0) return;

      const presentCount = student.attendanceRecords.filter(
        (r) => r.status === 'PRESENT' || r.status === 'LATE'
      ).length;

      const pct = Math.round((presentCount / total) * 100);
      if (pct < 75) {
        studentsBelowThresholdCount++;
        shortageStudents.push({
          id: student.id,
          name: student.name,
          rollNumber: student.rollNumber,
          department: student.department?.code,
          section: student.section?.name,
          percentage: pct,
          totalClasses: total,
          presentClasses: presentCount,
        });
      }
    });

    // Attendance by Department
    const departments = await prisma.department.findMany({
      include: {
        students: {
          include: { attendanceRecords: true },
        },
      },
    });

    const deptAttendance = departments.map((dept) => {
      let totalRecords = 0;
      let presentRecords = 0;

      dept.students.forEach((st) => {
        st.attendanceRecords.forEach((rec) => {
          totalRecords++;
          if (rec.status === 'PRESENT' || rec.status === 'LATE') presentRecords++;
        });
      });

      const percentage = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0;
      return {
        id: dept.id,
        name: dept.name,
        code: dept.code,
        percentage,
        totalStudents: dept.students.length,
      };
    });

    // Recent Attendance Sessions
    const recentSessions = await prisma.attendanceSession.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        subject: true,
        section: true,
        faculty: true,
        records: true,
      },
    });

    res.json({
      success: true,
      data: {
        cards: {
          totalStudents,
          totalFaculty,
          totalDepartments,
          totalSubjects,
          todayClasses: totalClassesToday,
          todayAttendancePercentage,
          shortageCount: studentsBelowThresholdCount,
        },
        deptAttendance,
        shortageStudents: shortageStudents.slice(0, 10),
        recentSessions: recentSessions.map((s) => ({
          id: s.id,
          subject: s.subject.name,
          section: s.section.name,
          faculty: s.faculty.name,
          date: s.date,
          hour: s.hour,
          totalStudents: s.records.length,
          presentCount: s.records.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').length,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Failed to load dashboard statistics.' });
  }
};

// 2. STUDENT MANAGEMENT
const getStudents = async (req, res) => {
  try {
    const { search, departmentId, sectionId, year, page = 1, limit = 50 } = req.query;

    const where = {};
    if (departmentId) where.departmentId = departmentId;
    if (sectionId) where.sectionId = sectionId;
    if (year) where.year = parseInt(year);

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { rollNumber: { contains: search } },
        { studentId: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const total = await prisma.student.count({ where });
    const students = await prisma.student.findMany({
      where,
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { rollNumber: 'asc' },
      include: {
        department: true,
        course: true,
        section: true,
        attendanceRecords: true,
      },
    });

    const formattedStudents = students.map((s) => {
      const totalClasses = s.attendanceRecords.length;
      const presentClasses = s.attendanceRecords.filter(
        (r) => r.status === 'PRESENT' || r.status === 'LATE'
      ).length;
      const attendancePercentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;

      return {
        ...s,
        totalClasses,
        presentClasses,
        attendancePercentage,
      };
    });

    res.json({
      success: true,
      data: formattedStudents,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch students list.' });
  }
};

const createStudent = async (req, res) => {
  try {
    const {
      studentId,
      rollNumber,
      name,
      email,
      phone,
      departmentId,
      courseId,
      sectionId,
      year,
      semester,
      academicYear,
      admissionYear,
      password = 'Password123!',
    } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email address is already in use.' });
    }

    const existingRoll = await prisma.student.findUnique({ where: { rollNumber } });
    if (existingRoll) {
      return res.status(400).json({ success: false, message: 'Roll number already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        passwordHash,
        role: 'STUDENT',
        phone,
      },
    });

    const student = await prisma.student.create({
      data: {
        userId: user.id,
        studentId,
        rollNumber,
        name,
        email: email.toLowerCase().trim(),
        phone,
        departmentId,
        courseId,
        sectionId,
        year,
        semester,
        academicYear,
        admissionYear,
      },
      include: {
        department: true,
        course: true,
        section: true,
      },
    });

    await createAuditLog({
      userId: req.user.id,
      action: 'STUDENT_CREATED',
      entity: 'Student',
      entityId: student.id,
      newValue: { name, rollNumber, email },
    });

    res.status(201).json({ success: true, message: 'Student created successfully.', data: student });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ success: false, message: 'Failed to create student account.' });
  }
};

const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, departmentId, courseId, sectionId, year, semester, isActive } = req.body;

    const existingStudent = await prisma.student.findUnique({ where: { id } });
    if (!existingStudent) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: {
        name,
        phone,
        departmentId,
        courseId,
        sectionId,
        year,
        semester,
        isActive: isActive !== undefined ? isActive : existingStudent.isActive,
      },
      include: { department: true, course: true, section: true },
    });

    if (name || phone) {
      await prisma.user.update({
        where: { id: existingStudent.userId },
        data: { name, phone, isActive: isActive !== undefined ? isActive : existingStudent.isActive },
      });
    }

    await createAuditLog({
      userId: req.user.id,
      action: 'STUDENT_UPDATED',
      entity: 'Student',
      entityId: id,
      oldValue: existingStudent,
      newValue: updatedStudent,
    });

    res.json({ success: true, message: 'Student details updated successfully.', data: updatedStudent });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update student details.' });
  }
};

const bulkImportStudents = async (req, res) => {
  try {
    const { students } = req.body;
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ success: false, message: 'Valid students array is required for import.' });
    }

    const defaultPasswordHash = await bcrypt.hash('Password123!', 10);
    const results = { imported: 0, failed: 0, errors: [] };

    for (const item of students) {
      try {
        const { studentId, rollNumber, name, email, departmentId, courseId, sectionId, year, semester, academicYear } = item;

        if (!studentId || !rollNumber || !name || !email || !departmentId || !courseId || !sectionId) {
          results.failed++;
          results.errors.push(`Row for ${name || rollNumber || 'Unknown'}: Missing required fields.`);
          continue;
        }

        const existing = await prisma.student.findFirst({
          where: { OR: [{ email }, { rollNumber }, { studentId }] },
        });

        if (existing) {
          results.failed++;
          results.errors.push(`Student ${rollNumber} (${email}) already exists.`);
          continue;
        }

        const user = await prisma.user.create({
          data: {
            name,
            email: email.toLowerCase().trim(),
            passwordHash: defaultPasswordHash,
            role: 'STUDENT',
          },
        });

        await prisma.student.create({
          data: {
            userId: user.id,
            studentId,
            rollNumber,
            name,
            email: email.toLowerCase().trim(),
            departmentId,
            courseId,
            sectionId,
            year: Number(year) || 1,
            semester: Number(semester) || 1,
            academicYear: academicYear || '2025-2026',
            admissionYear: 2023,
          },
        });

        results.imported++;
      } catch (err) {
        results.failed++;
        results.errors.push(`Error importing ${item.rollNumber}: ${err.message}`);
      }
    }

    await createAuditLog({
      userId: req.user.id,
      action: 'BULK_STUDENTS_IMPORTED',
      entity: 'Student',
      entityId: 'BULK',
      newValue: { count: results.imported, failed: results.failed },
    });

    res.json({
      success: true,
      message: `Imported ${results.imported} students successfully (${results.failed} skipped/failed).`,
      results,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to process bulk import.' });
  }
};

// 3. FACULTY MANAGEMENT
const getFaculty = async (req, res) => {
  try {
    const { departmentId, search } = req.query;

    const where = {};
    if (departmentId) where.departmentId = departmentId;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { employeeId: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const faculty = await prisma.faculty.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        department: true,
        facultyAssignments: {
          include: {
            subject: true,
            section: true,
          },
        },
      },
    });

    res.json({ success: true, data: faculty });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch faculty list.' });
  }
};

const createFaculty = async (req, res) => {
  try {
    const { employeeId, name, email, phone, departmentId, designation, password = 'Password123!' } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email address is already in use.' });
    }

    const existingEmp = await prisma.faculty.findUnique({ where: { employeeId } });
    if (existingEmp) {
      return res.status(400).json({ success: false, message: 'Employee ID already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        passwordHash,
        role: 'FACULTY',
        phone,
      },
    });

    const faculty = await prisma.faculty.create({
      data: {
        userId: user.id,
        employeeId,
        name,
        email: email.toLowerCase().trim(),
        phone,
        departmentId,
        designation,
      },
      include: { department: true },
    });

    await createAuditLog({
      userId: req.user.id,
      action: 'FACULTY_CREATED',
      entity: 'Faculty',
      entityId: faculty.id,
      newValue: { name, employeeId, email },
    });

    res.status(201).json({ success: true, message: 'Faculty created successfully.', data: faculty });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create faculty account.' });
  }
};

const updateFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, departmentId, designation, isActive } = req.body;

    const existing = await prisma.faculty.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Faculty member not found.' });

    const updated = await prisma.faculty.update({
      where: { id },
      data: {
        name,
        phone,
        departmentId,
        designation,
        isActive: isActive !== undefined ? isActive : existing.isActive,
      },
      include: { department: true },
    });

    if (name || phone) {
      await prisma.user.update({
        where: { id: existing.userId },
        data: { name, phone, isActive: isActive !== undefined ? isActive : existing.isActive },
      });
    }

    res.json({ success: true, message: 'Faculty details updated.', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update faculty details.' });
  }
};

// 4. DEPARTMENTS, COURSES, SECTIONS, SUBJECTS
const getDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: { students: true, faculty: true, courses: true, subjects: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: departments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch departments.' });
  }
};

const createDepartment = async (req, res) => {
  try {
    const { name, code, description } = req.body;
    const dept = await prisma.department.create({
      data: { name, code: code.toUpperCase().trim(), description },
    });
    res.status(201).json({ success: true, message: 'Department created.', data: dept });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Department code already exists or invalid data.' });
  }
};

const getCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      include: { department: true, _count: { select: { sections: true, students: true } } },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch courses.' });
  }
};

const createCourse = async (req, res) => {
  try {
    const { name, code, departmentId, durationYears } = req.body;
    const course = await prisma.course.create({
      data: { name, code: code.toUpperCase().trim(), departmentId, durationYears },
      include: { department: true },
    });
    res.status(201).json({ success: true, message: 'Course created.', data: course });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Course code already exists.' });
  }
};

const getSections = async (req, res) => {
  try {
    const sections = await prisma.section.findMany({
      include: { course: true, _count: { select: { students: true } } },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: sections });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch sections.' });
  }
};

const createSection = async (req, res) => {
  try {
    const { name, courseId, year, semester, academicYear } = req.body;
    const section = await prisma.section.create({
      data: { name, courseId, year, semester, academicYear },
      include: { course: true },
    });
    res.status(201).json({ success: true, message: 'Section created.', data: section });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to create section.' });
  }
};

const getSubjects = async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany({
      include: { department: true, course: true },
      orderBy: { code: 'asc' },
    });
    res.json({ success: true, data: subjects });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch subjects.' });
  }
};

const createSubject = async (req, res) => {
  try {
    const { name, code, credits, semester, courseId, departmentId } = req.body;
    const subject = await prisma.subject.create({
      data: { name, code: code.toUpperCase().trim(), credits, semester, courseId, departmentId },
      include: { department: true, course: true },
    });
    res.status(201).json({ success: true, message: 'Subject created.', data: subject });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Subject code already exists.' });
  }
};

const assignFacultyToSubject = async (req, res) => {
  try {
    const { facultyId, subjectId, sectionId, academicYear = '2025-2026' } = req.body;

    const assignment = await prisma.facultySubject.create({
      data: { facultyId, subjectId, sectionId, academicYear },
      include: { faculty: true, subject: true, section: true },
    });

    res.status(201).json({ success: true, message: 'Faculty assigned to subject successfully.', data: assignment });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Faculty assignment already exists for this section.' });
  }
};

// 5. AUDIT LOGS
const getAuditLogs = async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const logs = await prisma.auditLog.findMany({
      take: parseInt(limit),
      orderBy: { timestamp: 'desc' },
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
    });
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch audit logs.' });
  }
};

module.exports = {
  getDashboardStats,
  getStudents,
  createStudent,
  updateStudent,
  bulkImportStudents,
  getFaculty,
  createFaculty,
  updateFaculty,
  getDepartments,
  createDepartment,
  getCourses,
  createCourse,
  getSections,
  createSection,
  getSubjects,
  createSubject,
  assignFacultyToSubject,
  getAuditLogs,
};
