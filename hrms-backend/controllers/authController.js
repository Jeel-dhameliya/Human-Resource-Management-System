const crypto = require('crypto');
const User = require('../models/User');
const Employee = require('../models/Employee');
const generateToken = require('../utils/generateToken');
const { sendVerificationEmail } = require('../utils/sendEmail');

const generateEmployeeId = async (companyName, fullName) => {
  const companyPrefix = (companyName || 'Unknown').substring(0, 2).toUpperCase().padEnd(2, 'X');
  
  const names = fullName.trim().split(/\s+/);
  let namePrefix = '';
  if (names.length >= 2) {
    namePrefix = names[0].substring(0, 2) + names[names.length - 1].substring(0, 2);
  } else {
    namePrefix = names[0].substring(0, 4);
  }
  namePrefix = namePrefix.toUpperCase().padEnd(4, 'X');

  const year = new Date().getFullYear();

  // Find count of users created this year to get serial number
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year + 1, 0, 1);
  const count = await User.countDocuments({
    createdAt: { $gte: startOfYear, $lt: endOfYear }
  });
  
  const serial = String(count + 1).padStart(4, '0');
  
  return `${companyPrefix}${namePrefix}${year}${serial}`;
};

// @desc    Register a new user (spec 3.1.1)
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res, next) => {
  try {
    const { email, password, role, fullName, companyName, phone } = req.body;

    if (!email || !password || !fullName || !companyName) {
      return res.status(400).json({ message: 'Please provide email, password, full name, and company name.' });
    }

    // Basic password rule enforcement (spec: "Password must follow security rules")
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          'Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.',
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    const generatedEmployeeId = await generateEmployeeId(companyName, fullName);

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    const user = await User.create({
      employeeId: generatedEmployeeId,
      email,
      password,
      role: role === 'admin' ? 'admin' : 'employee',
      isVerified: true, // Auto-verify for now since there's no real SMTP configured
      verificationToken,
      verificationTokenExpires,
    });

    const logoPath = req.file ? req.file.path : '';

    // Create the linked Employee profile shell
    await Employee.create({
      userId: user._id,
      fullName,
      companyName,
      personalDetails: {
        phone: phone || '',
        address: '',
        profilePic: logoPath
      },
      jobDetails: {
        department: '',
        designation: '',
        employmentType: 'full-time',
      }
    });

    try {
      await sendVerificationEmail(user.email, verificationToken);
    } catch (emailErr) {
      console.error('Failed to send verification email:', emailErr.message);
      // Don't fail signup just because email didn't send — log it for ops to investigate
    }

    res.status(201).json({
      message: 'Signup successful. Please check your email to verify your account.',
      userId: user._id,
      employeeId: generatedEmployeeId
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email via token link (spec 3.1.1)
// @route   GET /api/auth/verify/:token
// @access  Public
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    }).select('+verificationToken +verificationTokenExpires');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification link.' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Log in a user (spec 3.1.2)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email }).select('+password');

    // Same error message for both cases so we don't leak which part was wrong
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in.' });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        employeeId: user.employeeId,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get the global company logo (from the first admin)
// @route   GET /api/auth/company-logo
// @access  Public
const getCompanyLogo = async (req, res, next) => {
  try {
    // Find the newest admin user's profile who has a profilePic
    const adminProfiles = await Employee.find({ 'personalDetails.profilePic': { $ne: '' } }).sort({ createdAt: -1 }).populate('userId');
    
    const adminProfileWithLogo = adminProfiles.find(p => p.userId?.role === 'admin');

    if (!adminProfileWithLogo) {
      return res.status(404).json({ message: 'No logo found.' });
    }

    res.status(200).json({ 
      logoUrl: `/${adminProfileWithLogo.personalDetails.profilePic}`,
      companyName: adminProfileWithLogo.companyName 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { signup, verifyEmail, login, getCompanyLogo };
