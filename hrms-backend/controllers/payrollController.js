const Payroll = require('../models/Payroll');

// @desc    Employee: view own payroll history, read-only (spec 3.6.1)
// @route   GET /api/payroll/me
// @access  Private
const getMyPayroll = async (req, res, next) => {
  try {
    const records = await Payroll.find({ employeeId: req.user._id }).sort({ year: -1, month: -1 });
    res.status(200).json(records);
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: view payroll of all employees, optionally filter by employeeId (spec 3.6.2)
// @route   GET /api/payroll/all?employeeId=
// @access  Private/Admin
const getAllPayroll = async (req, res, next) => {
  try {
    const { employeeId } = req.query;
    const query = employeeId ? { employeeId } : {};

    const records = await Payroll.find(query)
      .populate('employeeId', 'employeeId email')
      .sort({ year: -1, month: -1 });

    res.status(200).json(records);
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: create or update salary structure for an employee for a given month (spec 3.6.2)
// @route   POST /api/payroll
// @access  Private/Admin
const upsertPayroll = async (req, res, next) => {
  try {
    const { employeeId, basicSalary, allowances, deductions, month, year } = req.body;

    if (!employeeId || basicSalary === undefined || !month || !year) {
      return res
        .status(400)
        .json({ message: 'employeeId, basicSalary, month, and year are required.' });
    }

    const record = await Payroll.findOneAndUpdate(
      { employeeId, month, year },
      { basicSalary, allowances, deductions },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ message: 'Payroll record saved.', record });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyPayroll, getAllPayroll, upsertPayroll };
