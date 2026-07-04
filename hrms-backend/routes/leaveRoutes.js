const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
} = require('../controllers/leaveController');

router.post('/apply', protect, applyLeave);
router.get('/me', protect, getMyLeaves);

// Admin-only
router.get('/all', protect, requireRole('admin'), getAllLeaves);
router.patch('/:id/status', protect, requireRole('admin'), updateLeaveStatus);

module.exports = router;
