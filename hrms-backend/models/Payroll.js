const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    basicSalary: { type: Number, required: true, default: 0 },
    allowances: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    netSalary: { type: Number, default: 0 },
    month: { type: String, required: true }, // e.g. "July"
    year: { type: Number, required: true },
  },
  { timestamps: true }
);

// Auto-calculate net salary before saving
payrollSchema.pre('save', function (next) {
  this.netSalary = this.basicSalary + this.allowances - this.deductions;
  next();
});

// One payroll record per employee per month/year
payrollSchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Payroll', payrollSchema);
