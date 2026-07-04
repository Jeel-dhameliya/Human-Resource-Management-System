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

const multer = require('multer');
const fs = require('fs');

const uploadDir = 'uploads/leaves/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

router.post('/apply', protect, upload.single('attachment'), applyLeave);
router.get('/me', protect, getMyLeaves);

// Admin-only
router.get('/all', protect, requireRole('admin'), getAllLeaves);
router.patch('/:id/status', protect, requireRole('admin'), updateLeaveStatus);

module.exports = router;
