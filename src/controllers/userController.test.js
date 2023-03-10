const userServices = require('../services/userServices');
const { createCredentialsHandler, loginHandler, tokenValidationHandler } = require('./userController');

jest.mock('../services/userServices');

describe('createCredentialsHandler', () => {
  it('should call userServices.createCredentialsService with the correct arguments and send the response', async () => {
    const req = {
      body: {
        userName: 'testUser',
        password: 'testPassword'
      }
    };
    const res = {
      send: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    const expectedResponse = {
      id: 1,
      userName: 'testUser'
    };
    userServices.createCredentialsService.mockResolvedValue(expectedResponse);

    await createCredentialsHandler(req, res);

    expect(userServices.createCredentialsService).toHaveBeenCalledWith('testUser', 'testPassword');
    expect(res.send).toHaveBeenCalledWith(expectedResponse);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should send a 401 status code if userServices.createCredentialsService throws an error', async () => {
    const req = {
      body: {
        userName: 'testUser',
        password: 'testPassword'
      }
    };
    const res = {
      send: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    userServices.createCredentialsService.mockRejectedValue(new Error('Unauthorized'));

    await createCredentialsHandler(req, res);

    expect(userServices.createCredentialsService).toHaveBeenCalledWith('testUser', 'testPassword');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith('Unauthorized');
  });
});

describe('loginHandler', () => {
  it('should return a token if login is successful', async () => {
    const req = { body: { userName: 'testUser', password: 'testPassword' } };
    const token = 'testToken';
    userServices.loginService.mockResolvedValue(token);
    const res = { send: jest.fn() };

    await loginHandler(req, res);

    expect(userServices.loginService).toHaveBeenCalledWith(req.body.userName, req.body.password);
    expect(res.send).toHaveBeenCalledWith(token);
  });

  it('should return a 401 status code if login fails', async () => {
    const req = { body: { userName: 'testUser', password: 'testPassword' } };
    const error = new Error('Login failed');
    userServices.loginService.mockRejectedValue(error);
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    await loginHandler(req, res);

    expect(userServices.loginService).toHaveBeenCalledWith(req.body.userName, req.body.password);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith(error.message);
  });
});


describe('tokenValidationHandler', () => {

  it('should respond with true if token is valid', async () => {
    const req = {
      body: {
        token: 'valid_token',
      },
    };
    const res = {
      send: jest.fn(),
    };
    userServices.tokenValidationService.mockResolvedValue(true);

    await tokenValidationHandler(req, res);

    expect(userServices.tokenValidationService).toHaveBeenCalledWith('valid_token');
    expect(res.send).toHaveBeenCalledWith(true);
  });

  it('should respond with false if token is invalid', async () => {
    const req = {
      body: {
        token: 'invalid_token',
      },
    };
    const res = {
      send: jest.fn(),
    };
    userServices.tokenValidationService.mockResolvedValue(false);

    await tokenValidationHandler(req, res);

    expect(userServices.tokenValidationService).toHaveBeenCalledWith('invalid_token');
    expect(res.send).toHaveBeenCalledWith(false);
  });
});