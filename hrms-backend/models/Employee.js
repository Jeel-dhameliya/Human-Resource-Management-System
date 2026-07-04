const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    fullName: { type: String, required: true },
    companyName: { type: String, default: '' },
    personalDetails: {
      phone: { type: String, default: '' },
      address: { type: String, default: '' },
      profilePic: { type: String, default: '' }, // URL to stored image
      dateOfBirth: Date,
      nationality: { type: String, default: '' },
      personalEmail: { type: String, default: '' },
      gender: { type: String, enum: ['male', 'female', 'other', ''], default: '' },
      maritalStatus: { type: String, enum: ['single', 'married', 'divorced', 'widowed', ''], default: '' },
    },
    bankDetails: {
      accountNumber: { type: String, default: '' },
      bankName: { type: String, default: '' },
      ifscCode: { type: String, default: '' },
      panNo: { type: String, default: '' },
      uanNo: { type: String, default: '' },
      empCode: { type: String, default: '' },
    },
    jobDetails: {
      department: { type: String, default: '' },
      designation: { type: String, default: '' },
      manager: { type: String, default: '' },
      location: { type: String, default: '' },
      joinDate: { type: Date, default: Date.now },
      employmentType: {
        type: String,
        enum: ['full-time', 'part-time', 'contract'],
        default: 'full-time',
      },
    },
    resume: {
      about: { type: String, default: '' },
      whatILove: { type: String, default: '' },
      interests: { type: String, default: '' },
      skills: [{ type: String }],
      certifications: [{ type: String }],
    },
    salaryInfo: {
      monthWage: { type: Number, default: 0 },
      yearlyWage: { type: Number, default: 0 },
      workingDays: { type: Number, default: 5 },
      breakTime: { type: Number, default: 1 },
      components: {
        basicSalary: { percentage: { type: Number, default: 50 }, amount: { type: Number, default: 0 } },
        houseRentAllowance: { percentage: { type: Number, default: 50 }, amount: { type: Number, default: 0 } },
        standardAllowance: { percentage: { type: Number, default: 16.67 }, amount: { type: Number, default: 0 } },
        performanceBonus: { percentage: { type: Number, default: 8.33 }, amount: { type: Number, default: 0 } },
        leaveTravelAllowance: { percentage: { type: Number, default: 8.33 }, amount: { type: Number, default: 0 } },
        fixedAllowance: { percentage: { type: Number, default: 16.67 }, amount: { type: Number, default: 0 } },
      },
      pf: {
        employee: { percentage: { type: Number, default: 12 }, amount: { type: Number, default: 0 } },
        employer: { percentage: { type: Number, default: 12 }, amount: { type: Number, default: 0 } },
      },
      tax: {
        professionalTax: { amount: { type: Number, default: 200 } }
      }
    },
    documents: [
      {
        name: { type: String },
        url: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Employee', employeeSchema);
