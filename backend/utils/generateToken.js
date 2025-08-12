// utils/generateToken.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};