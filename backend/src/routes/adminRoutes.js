const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createStudentSchema,
  createFacultySchema,
  createDepartmentSchema,
  createCourseSchema,
  createSectionSchema,
  createSubjectSchema,
} = require('../validators/schemas');

// Require ADMIN role for all routes in this file
router.use(authenticate, authorize('ADMIN'));

// Dashboard Stats
router.get('/dashboard', adminController.getDashboardStats);

// Students
router.get('/students', adminController.getStudents);
router.post('/students', validate(createStudentSchema), adminController.createStudent);
router.put('/students/:id', adminController.updateStudent);
router.post('/students/bulk-import', adminController.bulkImportStudents);

// Faculty
router.get('/faculty', adminController.getFaculty);
router.post('/faculty', validate(createFacultySchema), adminController.createFaculty);
router.put('/faculty/:id', adminController.updateFaculty);

// Departments
router.get('/departments', adminController.getDepartments);
router.post('/departments', validate(createDepartmentSchema), adminController.createDepartment);

// Courses
router.get('/courses', adminController.getCourses);
router.post('/courses', validate(createCourseSchema), adminController.createCourse);

// Sections
router.get('/sections', adminController.getSections);
router.post('/sections', validate(createSectionSchema), adminController.createSection);

// Subjects
router.get('/subjects', adminController.getSubjects);
router.post('/subjects', validate(createSubjectSchema), adminController.createSubject);
router.post('/assign-faculty', adminController.assignFacultyToSubject);

// Audit Logs
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;
