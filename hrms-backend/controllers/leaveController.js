const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');

// @desc    Employee applies for leave (spec 3.5.1)
// @route   POST /api/leave/apply
// @access  Private
const applyLeave = async (req, res, next) => {
  try {
    const { type, startDate, endDate, remarks } = req.body;

    if (!type || !startDate || !endDate) {
      return res.status(400).json({ message: 'type, startDate, and endDate are required.' });
    }

    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ message: 'startDate cannot be after endDate.' });
    }

    const leave = await Leave.create({
      employeeId: req.user._id,
      type,
      startDate,
      endDate,
      remarks,
    });

    res.status(201).json({ message: 'Leave request submitted.', leave });
  } catch (error) {
    next(error);
  }
};

// @desc    Employee: view own leave requests
// @route   GET /api/leave/me
// @access  Private
const getMyLeaves = async (req, res, next) => {
  try {
    const leaves = await Leave.find({ employeeId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(leaves);
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: view all leave requests, optionally filter by status (spec 3.5.2)
// @route   GET /api/leave/all?status=pending
// @access  Private/Admin
const getAllLeaves = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};

    const leaves = await Leave.find(query)
      .populate('employeeId', 'employeeId email')
      .sort({ createdAt: -1 });

    res.status(200).json(leaves);
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: approve or reject a leave request (spec 3.5.2)
// @route   PATCH /api/leave/:id/status
// @access  Private/Admin
const updateLeaveStatus = async (req, res, next) => {
  try {
    const { status, adminComment } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "status must be 'approved' or 'rejected'." });
    }

    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found.' });
    }

    leave.status = status;
    leave.adminComment = adminComment || '';
    leave.reviewedBy = req.user._id;
    await leave.save();

    // Spec 3.5.2: "Changes reflect immediately in employee records."
    // On approval, write matching Attendance entries so the leave shows up
    // on the employee's attendance calendar automatically (spec 3.5.1).
    if (status === 'approved') {
      const dates = [];
      let current = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      while (current <= end) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }

      const bulkOps = dates.map((date) => ({
        updateOne: {
          filter: { employeeId: leave.employeeId, date },
          update: { $set: { status: 'leave' } },
          upsert: true,
        },
      }));

      if (bulkOps.length > 0) {
        await Attendance.bulkWrite(bulkOps);
      }
    }

    res.status(200).json({ message: `Leave ${status}.`, leave });
  } catch (error) {
    next(error);
  }
};

module.exports = { applyLeave, getMyLeaves, getAllLeaves, updateLeaveStatus };
