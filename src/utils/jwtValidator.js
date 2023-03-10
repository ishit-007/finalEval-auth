const jwt = require('jsonwebtoken');
const db = require('../../database/models');

const verifyJWT = async (token) => {
  try {
    const jwtSecret = 'secret';
    const decodedToken = jwt.verify(token, jwtSecret);

    const user = await db.userauth.findOne({
      where: {
        userName: decodedToken.userName,
      }
    });
    if (!user) {
      return [false, decodedToken];
    }
    return [true, decodedToken];
  }
  catch (error) {
    return [false, null];
  }
};
module.exports = {
  verifyJWT,
};