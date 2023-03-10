const { generateJwtToken } = require('./jwtGenerator');
const jwt = require('jsonwebtoken');

describe('generateJwtToken', () => {
  test('returns a valid JWT token', () => {
    const user = { id: 123, username: 'testuser' };
    const token = generateJwtToken(user);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
    expect(() => jwt.verify(token, 'secret')).not.toThrow();
  });
});
