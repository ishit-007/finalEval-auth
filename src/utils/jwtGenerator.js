const jwt = require('jsonwebtoken');
const generateJwtToken = (user) => {
  const jwtSecret = 'secret';
  const token = jwt.sign(user, jwtSecret, { expiresIn: '1h' });
  return token;
};
module.exports = {
  generateJwtToken,
};