const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/facultyController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('FACULTY', 'ADMIN'));

router.get('/dashboard', facultyController.getFacultyDashboard);
router.get('/assigned-classes', facultyController.getAssignedClasses);
router.get('/enrolled-students', facultyController.getEnrolledStudents);

module.exports = router;
