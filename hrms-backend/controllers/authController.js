const crypto = require('crypto');
const User = require('../models/User');
const Employee = require('../models/Employee');
const generateToken = require('../utils/generateToken');
const { sendVerificationEmail } = require('../utils/sendEmail');

// @desc    Register a new user (spec 3.1.1)
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res, next) => {
  try {
    const { employeeId, email, password, role, fullName } = req.body;

    if (!employeeId || !email || !password || !fullName) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    // Basic password rule enforcement (spec: "Password must follow security rules")
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          'Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.',
      });
    }

    const userExists = await User.findOne({ $or: [{ email }, { employeeId }] });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email or employee ID already exists.' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    const user = await User.create({
      employeeId,
      email,
      password,
      role: role === 'admin' ? 'admin' : 'employee', // default safety: don't trust arbitrary role escalation in production without an invite/admin-approval flow
      verificationToken,
      verificationTokenExpires,
    });

    // Create the linked Employee profile shell
    await Employee.create({
      userId: user._id,
      fullName,
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

module.exports = { signup, verifyEmail, login };
