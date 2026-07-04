const jwt = require('jsonwebtoken');

/**
 * Generates a signed JWT containing the user's id and role.
 * @param {string} userId - MongoDB _id of the user
 * @param {string} role - 'admin' | 'employee'
 */
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

module.exports = generateToken;
