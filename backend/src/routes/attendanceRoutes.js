const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { recordAttendanceSchema, updateAttendanceRecordSchema } = require('../validators/schemas');

router.use(authenticate);

// Faculty & Admin can create sessions and view history
router.post(
  '/session',
  authorize('FACULTY', 'ADMIN'),
  validate(recordAttendanceSchema),
  attendanceController.createAttendanceSession
);

router.get('/session/:id', attendanceController.getAttendanceSession);
router.get('/history', attendanceController.getAttendanceHistory);

// Single record correction (Faculty & Admin)
router.put(
  '/records/:id',
  authorize('FACULTY', 'ADMIN'),
  validate(updateAttendanceRecordSchema),
  attendanceController.updateAttendanceRecord
);

module.exports = router;
