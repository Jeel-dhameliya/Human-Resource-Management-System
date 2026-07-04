const Attendance = require('../models/Attendance');

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// @desc    Employee check-in (spec 3.4.1)
// @route   POST /api/attendance/checkin
// @access  Private
const checkIn = async (req, res, next) => {
  try {
    const today = startOfDay(new Date());

    let record = await Attendance.findOne({ employeeId: req.user._id, date: today });

    if (record && record.checkIn) {
      return res.status(400).json({ message: 'You have already checked in today.' });
    }

    if (!record) {
      record = await Attendance.create({
        employeeId: req.user._id,
        date: today,
        status: 'present',
        checkIn: new Date(),
      });
    } else {
      record.checkIn = new Date();
      record.status = 'present';
      await record.save();
    }

    res.status(200).json({ message: 'Checked in successfully.', record });
  } catch (error) {
    next(error);
  }
};

// @desc    Employee check-out (spec 3.4.1)
// @route   POST /api/attendance/checkout
// @access  Private
const checkOut = async (req, res, next) => {
  try {
    const today = startOfDay(new Date());

    const record = await Attendance.findOne({ employeeId: req.user._id, date: today });

    if (!record || !record.checkIn) {
      return res.status(400).json({ message: 'You must check in before checking out.' });
    }
    if (record.checkOut) {
      return res.status(400).json({ message: 'You have already checked out today.' });
    }

    record.checkOut = new Date();

    // Simple half-day rule: less than 4 hours between check-in and check-out
    const hoursWorked = (record.checkOut - record.checkIn) / (1000 * 60 * 60);
    if (hoursWorked < 4) {
      record.status = 'half-day';
    }

    await record.save();

    res.status(200).json({ message: 'Checked out successfully.', record });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in employee's own attendance, optionally filtered by month/year (spec 3.4.2)
// @route   GET /api/attendance/me?month=7&year=2026
// @access  Private
const getMyAttendance = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const query = { employeeId: req.user._id };

    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      query.date = { $gte: start, $lte: end };
    }

    const records = await Attendance.find(query).sort({ date: 1 });
    res.status(200).json(records);
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: get attendance for all employees, or filter by employeeId (spec 3.4.2)
// @route   GET /api/attendance/all?employeeId=&month=&year=
// @access  Private/Admin
const getAllAttendance = async (req, res, next) => {
  try {
    const { employeeId, month, year } = req.query;
    const query = {};

    if (employeeId) query.employeeId = employeeId;

    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      query.date = { $gte: start, $lte: end };
    }

    const records = await Attendance.find(query)
      .populate('employeeId', 'employeeId email')
      .sort({ date: 1 });

    res.status(200).json(records);
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: manually mark/update attendance for an employee (e.g. marking Absent)
// @route   POST /api/attendance/mark
// @access  Private/Admin
const markAttendance = async (req, res, next) => {
  try {
    const { employeeId, date, status } = req.body;

    if (!employeeId || !date || !status) {
      return res.status(400).json({ message: 'employeeId, date, and status are required.' });
    }

    const day = startOfDay(date);

    const record = await Attendance.findOneAndUpdate(
      { employeeId, date: day },
      { $set: { status } },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({ message: 'Attendance marked.', record });
  } catch (error) {
    next(error);
  }
};

module.exports = { checkIn, checkOut, getMyAttendance, getAllAttendance, markAttendance };
