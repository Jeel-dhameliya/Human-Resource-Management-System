const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for port 465, false for other ports (e.g. 587)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends an email.
 * @param {string} to - recipient email
 * @param {string} subject
 * @param {string} html
 */
const sendEmail = async (to, subject, html) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
};

const sendVerificationEmail = async (to, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;
  const html = `
    <h2>Verify your HRMS account</h2>
    <p>Click the link below to verify your email address. This link expires in 24 hours.</p>
    <a href="${verifyUrl}">${verifyUrl}</a>
  `;
  await sendEmail(to, 'Verify Your HRMS Account', html);
};

module.exports = { sendEmail, sendVerificationEmail };
