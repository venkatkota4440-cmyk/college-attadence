const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('STUDENT', 'ADMIN'));

router.get('/dashboard', studentController.getStudentDashboard);
router.get('/attendance-history', studentController.getStudentAttendanceHistory);

module.exports = router;
