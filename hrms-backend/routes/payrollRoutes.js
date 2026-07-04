const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { getMyPayroll, getAllPayroll, upsertPayroll } = require('../controllers/payrollController');

router.get('/me', protect, getMyPayroll);

// Admin-only
router.get('/all', protect, requireRole('admin'), getAllPayroll);
router.post('/', protect, requireRole('admin'), upsertPayroll);

module.exports = router;
