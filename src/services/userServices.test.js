const { createCredentialsService, loginService, tokenValidationService } = require('./userServices');
const bcrypt = require('bcryptjs');
const db = require('../../database/models');
const jwtGenerator = require('../utils/jwtGenerator');
const redis = require('../utils/redis');
const jwtValidator = require('../utils/jwtValidator');

jest.mock('../../database/models');
jest.mock('bcryptjs');
jest.mock('../utils/redis');
jest.mock('../utils/jwtGenerator');
jest.mock('../utils/jwtValidator');

describe('createCredentialsService', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should create user credentials', async () => {
    const userName = 'mockUser';
    const password = 'mockPassword';
    const salt = 'testSalt';
    const hashedPassword = 'testHashedPassword';
    bcrypt.genSaltSync.mockReturnValueOnce(salt);
    bcrypt.hashSync.mockReturnValueOnce(hashedPassword);
    db.userauth.findOne.mockReturnValueOnce(null);
    db.userauth.create.mockResolvedValueOnce({ userName, password: hashedPassword });


    const user = await createCredentialsService(userName, password);

    expect(user.userName).toEqual(userName);
    expect(bcrypt.genSaltSync).toHaveBeenCalledWith(10);
    expect(bcrypt.hashSync).toHaveBeenCalledWith(password, salt);
    expect(db.userauth.findOne).toHaveBeenCalledWith({ where: { userName } });
    expect(db.userauth.create).toHaveBeenCalledWith({ userName, password: hashedPassword });
  });

  it('should throw an error if user already exists', async () => {

    const userName = 'testUser';
    const password = 'testPassword';
    db.userauth.findOne.mockReturnValueOnce({ userName });

    await expect(createCredentialsService(userName, password)).rejects.toThrow('User Already Exists');
    expect(db.userauth.findOne).toHaveBeenCalledWith({ where: { userName } });
    expect(db.userauth.create).not.toHaveBeenCalled();
  });
});

describe('loginService', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should login user and return token', async () => {
    // Arrange
    const userName = 'testUser';
    const password = 'testPassword';
    const userId = 123;
    const user = { dataValues: { id: userId, userName, password: bcrypt.hashSync(password, 10) } };
    db.userauth.findOne.mockResolvedValueOnce(user);
    const token = 'testToken';
    jwtGenerator.generateJwtToken.mockReturnValueOnce(token);
    const redisClient = { set: jest.fn() };
    redis.connectRedis.mockResolvedValueOnce(redisClient);
    bcrypt.compareSync = jest.fn().mockReturnValueOnce(true);


    const result = await loginService(userName, password);

    expect(result).toEqual(token);
    expect(db.userauth.findOne).toHaveBeenCalledWith({ where: { userName } });
    expect(bcrypt.compareSync).toHaveBeenCalledWith(password, user.password);
    expect(jwtGenerator.generateJwtToken).toHaveBeenCalledWith({ id: userId, userName, time: expect.any(Date) });
    expect(redis.connectRedis).toHaveBeenCalled();
    expect(redisClient.set).toHaveBeenCalledWith(token, '1');
  });

  it('should throw an error if user not found', async () => {
    const userName = 'testUser';
    const password = 'testPassword';
    db.userauth.findOne.mockResolvedValueOnce(null);

    await expect(loginService(userName, password)).rejects.toThrow('User Not Found');
    expect(db.userauth.findOne).toHaveBeenCalledWith({ where: { userName } });
    expect(bcrypt.compareSync).not.toHaveBeenCalled();
    expect(jwtGenerator.generateJwtToken).not.toHaveBeenCalled();
    expect(redis.connectRedis).not.toHaveBeenCalled();
  });

  it('should throw an error if password is incorrect', async () => {
    const userName = 'testUser';
    const password = 'testPassword';
    const user = { dataValues: { userName, password: bcrypt.hashSync('incorrectPassword', 10) } };
    db.userauth.findOne.mockResolvedValueOnce(user);

    await expect(loginService(userName, password)).rejects.toThrow('Incorrect Password');
    expect(db.userauth.findOne).toHaveBeenCalledWith({ where: { userName } });
    expect(bcrypt.compareSync).toHaveBeenCalledWith(password, user.password);
    expect(jwtGenerator.generateJwtToken).not.toHaveBeenCalled();
    expect(redis.connectRedis).not.toHaveBeenCalled();
  });
});

describe('tokenValidationService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return true if token is valid and exists in Redis', async () => {
    const token = 'valid_token';
    const decodedToken = { id: 1, userName: 'testUser', time: new Date() };

    jwtValidator.verifyJWT.mockResolvedValue([true, decodedToken]);


    const redisClient = {
      get: jest.fn().mockResolvedValue('1'),
    };
    redis.connectRedis.mockResolvedValue(redisClient);

    const result = await tokenValidationService(token);

    expect(jwtValidator.verifyJWT).toHaveBeenCalledWith(token);
    expect(redis.connectRedis).toHaveBeenCalled();
    expect(redisClient.get).toHaveBeenCalledWith(token);
    expect(result).toBe(decodedToken);
  });

  it('should return false if token is invalid', async () => {
    const token = 'invalid_token';

    jwtValidator.verifyJWT.mockResolvedValue([false, null]);

    const result = await tokenValidationService(token);

    expect(jwtValidator.verifyJWT).toHaveBeenCalledWith(token);
    expect(redis.connectRedis).toHaveBeenCalledTimes(1);
    expect(result).toBe(null);
  });

  it('should return false if token is valid but does not exist in Redis', async () => {
    const token = 'valid_token';
    const decodedToken = { id: 1, userName: 'testUser', time: new Date() };

    jwtValidator.verifyJWT.mockResolvedValue([false, decodedToken]);

    const redisClient = {
      get: jest.fn().mockResolvedValue(null),
    };
    redis.connectRedis.mockResolvedValue(redisClient);

    const result = await tokenValidationService(token);

    expect(jwtValidator.verifyJWT).toHaveBeenCalledWith(token);
    expect(redis.connectRedis).toHaveBeenCalled();
    expect(redisClient.get).toHaveBeenCalledWith(token);
    expect(result).toBe(null);
  });

});
