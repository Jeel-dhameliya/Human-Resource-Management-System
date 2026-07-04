const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
  getMyProfile,
  updateMyProfile,
  getAllEmployees,
  getEmployeeById,
  updateEmployeeById,
} = require('../controllers/employeeController');

const multer = require('multer');
const fs = require('fs');

const uploadDir = 'uploads/profiles/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Employee's own profile
router.get('/me', protect, getMyProfile);
router.put('/me', protect, upload.single('profilePic'), updateMyProfile);

// Admin-only: manage any employee
router.get('/', protect, requireRole('admin'), getAllEmployees);
router.get('/:id', protect, requireRole('admin'), getEmployeeById);
router.put('/:id', protect, requireRole('admin'), upload.single('profilePic'), updateEmployeeById);

module.exports = router;
