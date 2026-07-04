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

// Employee's own profile
router.get('/me', protect, getMyProfile);
router.put('/me', protect, updateMyProfile);

// Admin-only: manage any employee
router.get('/', protect, requireRole('admin'), getAllEmployees);
router.get('/:id', protect, requireRole('admin'), getEmployeeById);
router.put('/:id', protect, requireRole('admin'), updateEmployeeById);

module.exports = router;
