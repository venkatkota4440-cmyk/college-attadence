const { z } = require('zod');

const loginSchema = z.object({
  email: z.string().email('Invalid email address format.'),
  password: z.string().min(1, 'Password is required.'),
});

const createStudentSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  rollNumber: z.string().min(1, 'Roll number is required'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  departmentId: z.string().min(1, 'Department is required'),
  courseId: z.string().min(1, 'Course is required'),
  sectionId: z.string().min(1, 'Section is required'),
  year: z.number().int().min(1).max(4),
  semester: z.number().int().min(1).max(8),
  academicYear: z.string().min(1, 'Academic year is required'),
  admissionYear: z.number().int().min(2000),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

const createFacultySchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  departmentId: z.string().min(1, 'Department is required'),
  designation: z.string().min(1, 'Designation is required'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

const createDepartmentSchema = z.object({
  name: z.string().min(1, 'Department name is required'),
  code: z.string().min(1, 'Department code is required'),
  description: z.string().optional(),
});

const createCourseSchema = z.object({
  name: z.string().min(1, 'Course name is required'),
  code: z.string().min(1, 'Course code is required'),
  departmentId: z.string().min(1, 'Department is required'),
  durationYears: z.number().int().min(1).default(4),
});

const createSectionSchema = z.object({
  name: z.string().min(1, 'Section name is required'),
  courseId: z.string().min(1, 'Course is required'),
  year: z.number().int().min(1),
  semester: z.number().int().min(1),
  academicYear: z.string().min(1, 'Academic year is required'),
});

const createSubjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required'),
  code: z.string().min(1, 'Subject code is required'),
  credits: z.number().int().min(1),
  semester: z.number().int().min(1),
  courseId: z.string().min(1, 'Course is required'),
  departmentId: z.string().min(1, 'Department is required'),
});

const recordAttendanceSchema = z.object({
  subjectId: z.string().min(1, 'Subject is required'),
  sectionId: z.string().min(1, 'Section is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  hour: z.number().int().min(1).max(10),
  topic: z.string().optional(),
  records: z.array(
    z.object({
      studentId: z.string().min(1),
      status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
      remarks: z.string().nullable().optional(),
    })
  ).min(1, 'At least one student record is required'),
});

const updateAttendanceRecordSchema = z.object({
  status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
  remarks: z.string().nullable().optional(),
  reason: z.string().min(3, 'Reason for correction is required'),
});

module.exports = {
  loginSchema,
  createStudentSchema,
  createFacultySchema,
  createDepartmentSchema,
  createCourseSchema,
  createSectionSchema,
  createSubjectSchema,
  recordAttendanceSchema,
  updateAttendanceRecordSchema,
};
