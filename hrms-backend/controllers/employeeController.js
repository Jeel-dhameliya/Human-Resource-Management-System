const Employee = require('../models/Employee');
const Payroll = require('../models/Payroll');

// @desc    Get logged-in employee's own profile (spec 3.3.1)
// @route   GET /api/employees/me
// @access  Private
const getMyProfile = async (req, res, next) => {
  try {
    const profile = await Employee.findOne({ userId: req.user._id }).populate(
      'userId',
      'employeeId email role'
    );

    if (!profile) {
      return res.status(404).json({ message: 'Employee profile not found.' });
    }

    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
};

// @desc    Update logged-in employee's own profile — limited fields only (spec 3.3.2)
// @route   PUT /api/employees/me
// @access  Private
const updateMyProfile = async (req, res, next) => {
  try {
    // Employees may only edit these fields per spec: "address, phone, profile picture"
    const allowedUpdates = ['phone', 'address', 'profilePic', 'resume'];
    const updates = {};

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'resume') {
          updates['resume'] = req.body.resume;
        } else {
          updates[`personalDetails.${field}`] = req.body[field];
        }
      }
    });

      if (req.file) {
        updates['personalDetails.profilePic'] = req.file.path.replace(/\\/g, '/');
      }
      const profile = await Employee.findOneAndUpdate(
      { userId: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({ message: 'Employee profile not found.' });
    }

    res.status(200).json({ message: 'Profile updated successfully.', profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: get list of all employees
// @route   GET /api/employees
// @access  Private/Admin
const getAllEmployees = async (req, res, next) => {
  try {
    const employees = await Employee.find().populate('userId', 'employeeId email role isVerified');
    res.status(200).json(employees);
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: get a single employee's full profile
// @route   GET /api/employees/:id
// @access  Private/Admin
const getEmployeeById = async (req, res, next) => {
  try {
    const profile = await Employee.findById(req.params.id).populate(
      'userId',
      'employeeId email role isVerified'
    );

    if (!profile) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: update any employee's full details (spec 3.3.2 — "Admin can edit all employee details")
// @route   PUT /api/employees/:id
// @access  Private/Admin
const updateEmployeeById = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      if (!updateData.personalDetails) updateData.personalDetails = {};
      updateData.personalDetails.profilePic = req.file.path.replace(/\\/g, '/');
    }
    const profile = await Employee.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!profile) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    res.status(200).json({ message: 'Employee updated successfully.', profile });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  getAllEmployees,
  getEmployeeById,
  updateEmployeeById,
};
