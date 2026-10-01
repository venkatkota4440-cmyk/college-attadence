const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/section/:sectionId', authorize('ADMIN', 'FACULTY'), reportController.getSectionReport);
router.get('/subject/:subjectId', authorize('ADMIN', 'FACULTY'), reportController.getSubjectReport);
router.get('/student/:studentId', authorize('ADMIN', 'FACULTY', 'STUDENT'), reportController.getStudentReport);

module.exports = router;
