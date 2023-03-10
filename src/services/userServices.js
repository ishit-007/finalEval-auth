/* eslint-disable no-unused-vars */
const bcrypt = require('bcryptjs');
const db = require('../../database/models');
const jwtGenerator = require('../utils/jwtGenerator');
const jwtValidator = require('../utils/jwtValidator');
const redis = require('../utils/redis');


const createCredentialsService = async (userName, password) => {
  const saltRounds = 10;
  const salt = bcrypt.genSaltSync(saltRounds);
  const userExists = await db.userauth.findOne({
    where: {
      userName: userName,
    }
  });
  if (userExists) {
    throw new Error('User Already Exists');
  }
  else {
    const encryptedPassword = bcrypt.hashSync(password, salt);
    const user = await db.userauth.create({
      userName: userName,
      password: encryptedPassword,
    });
    return user;
  }
};
const loginService = async (userName, password) => {
  console.log('Login Service');
  const user = await db.userauth.findOne({
    where: {
      userName: userName,
    },
  });
  if (!user) {
    throw new Error('User Not Found');
  }

  const isPasswordCorrect = bcrypt.compareSync(password, user.password);
  if (isPasswordCorrect) {
    const userData = {
      id: user.dataValues.id,
      userName: user.dataValues.userName,
      time: new Date(),
    };
    const token = await jwtGenerator.generateJwtToken(userData);
    // console.log('Token: ', token);
    const redisClient = await redis.connectRedis();
    redisClient.set(String(token), '1');
    return token;
  } else {
    throw new Error('Incorrect Password');
  }
};

const tokenValidationService = async (token) => {
  const tokenValidationResp = await jwtValidator.verifyJWT(token);
  const redisClient = await redis.connectRedis();
  const existsInRedis = await redisClient.get(token);
  if (tokenValidationResp[0]) {
    return tokenValidationResp[1];
  }
  else {
    return null;
  }
};
module.exports = {
  createCredentialsService,
  loginService,
  tokenValidationService,
};