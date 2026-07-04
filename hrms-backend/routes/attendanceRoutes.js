const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
  checkIn,
  checkOut,
  getMyAttendance,
  getAllAttendance,
  markAttendance,
} = require('../controllers/attendanceController');

router.post('/checkin', protect, checkIn);
router.post('/checkout', protect, checkOut);
router.get('/me', protect, getMyAttendance);

// Admin-only
router.get('/all', protect, requireRole('admin'), getAllAttendance);
router.post('/mark', protect, requireRole('admin'), markAttendance);

module.exports = router;
