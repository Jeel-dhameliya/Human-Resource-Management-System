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
    },
    jobDetails: {
      department: { type: String, default: '' },
      designation: { type: String, default: '' },
      joinDate: { type: Date, default: Date.now },
      employmentType: {
        type: String,
        enum: ['full-time', 'part-time', 'contract'],
        default: 'full-time',
      },
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
