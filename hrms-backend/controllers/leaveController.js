const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

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

    const empProfile = await Employee.findOne({ userId: req.user._id });
    const attachmentPath = req.file ? req.file.path.replace(/\\/g, '/') : '';

    const leave = await Leave.create({
      employeeId: req.user._id,
      type: type.charAt(0).toUpperCase() + type.slice(1).toLowerCase(),
      startDate,
      endDate,
      remarks,
      attachment: attachmentPath,
      employeeName: empProfile?.fullName || req.user.email || 'Employee',
      status: 'Pending'
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
    const empProfile = await Employee.findOne({ userId: req.user._id });

    const enrichedLeaves = leaves.map(leave => {
      const leaveObj = leave.toObject();
      leaveObj.status = leaveObj.status ? leaveObj.status.charAt(0).toUpperCase() + leaveObj.status.slice(1).toLowerCase() : 'Pending';
      leaveObj.type = leaveObj.type ? leaveObj.type.charAt(0).toUpperCase() + leaveObj.type.slice(1).toLowerCase() : 'Paid';
      leaveObj.employeeName = leaveObj.employeeName || empProfile?.fullName || 'Me';
      leaveObj.employee = {
        _id: empProfile?._id || leave.employeeId,
        fullName: leaveObj.employeeName
      };
      return leaveObj;
    });

    res.status(200).json(enrichedLeaves);
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
    const query = {};
    if (status) {
      query.status = { $regex: new RegExp(`^${status}$`, 'i') };
    }

    const leaves = await Leave.find(query)
      .populate('employeeId', 'employeeId email')
      .sort({ createdAt: -1 });

    const empProfiles = await Employee.find({});
    const empMap = new Map();
    empProfiles.forEach(p => empMap.set(p.userId?.toString(), p));

    const enrichedLeaves = leaves.map(leave => {
      const leaveObj = leave.toObject();
      const emp = empMap.get(leave.employeeId?._id?.toString() || leave.employeeId?.toString());
      leaveObj.status = leaveObj.status ? leaveObj.status.charAt(0).toUpperCase() + leaveObj.status.slice(1).toLowerCase() : 'Pending';
      leaveObj.type = leaveObj.type ? leaveObj.type.charAt(0).toUpperCase() + leaveObj.type.slice(1).toLowerCase() : 'Paid';
      leaveObj.employeeName = leaveObj.employeeName || emp?.fullName || leave.employeeId?.email || 'Unknown';
      leaveObj.employee = {
        _id: emp?._id || leave.employeeId?._id,
        fullName: leaveObj.employeeName,
        email: leave.employeeId?.email
      };
      return leaveObj;
    });

    res.status(200).json(enrichedLeaves);
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
    const normalizedStatus = status ? status.toLowerCase() : '';

    if (!['approved', 'rejected'].includes(normalizedStatus)) {
      return res.status(400).json({ message: "status must be 'Approved' or 'Rejected'." });
    }

    const finalStatus = normalizedStatus === 'approved' ? 'Approved' : 'Rejected';

    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found.' });
    }

    leave.status = finalStatus;
    leave.adminComment = adminComment || '';
    leave.reviewedBy = req.user._id;
    await leave.save();

    // Spec 3.5.2: "Changes reflect immediately in employee records."
    // On approval, write matching Attendance entries so the leave shows up
    // on the employee's attendance calendar automatically (spec 3.5.1).
    if (normalizedStatus === 'approved') {
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

    const emp = await Employee.findOne({ userId: leave.employeeId });
    const leaveObj = leave.toObject();
    leaveObj.employeeName = leaveObj.employeeName || emp?.fullName || 'Employee';
    leaveObj.employee = {
      _id: emp?._id || leave.employeeId,
      fullName: leaveObj.employeeName
    };

    res.status(200).json({ message: `Leave ${finalStatus}.`, leave: leaveObj });
  } catch (error) {
    next(error);
  }
};

module.exports = { applyLeave, getMyLeaves, getAllLeaves, updateLeaveStatus };
