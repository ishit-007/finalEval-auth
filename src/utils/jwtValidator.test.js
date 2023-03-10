const jwt = require('jsonwebtoken');
const db = require('../../database/models');
const { verifyJWT } = require('./jwtValidator');

describe('verifyJWT', () => {
  it('should return false if the user is not found in the database', async () => {
    const token = jwt.sign({ userName: 'testUser' }, 'secret');
    db.userauth.findOne = jest.fn().mockResolvedValue(null);
    const result = await verifyJWT(token);
    expect(result[0]).toBe(false);
  });

  it('should return true if the user is found in the database', async () => {
    const token = jwt.sign({ userName: 'testUser' }, 'secret');
    const user = { userName: 'testUser' };
    db.userauth.findOne = jest.fn().mockResolvedValue(user);
    const result = await verifyJWT(token);
    expect(result[0]).toBe(true);
  });

  it('should return false if the token is invalid', async () => {
    const token = 'invalidToken';
    const result = await verifyJWT(token);
    expect(result).toEqual([false, null]);
  });
});

