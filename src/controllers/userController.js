const userServices = require('../services/userServices');

const createCredentialsHandler = async (req, res) => {
  const userName = req.body.userName;
  const password = req.body.password;
  try {
    const createUserResp = await userServices.createCredentialsService(userName, password);
    res.send(createUserResp);
  }
  catch (err) {
    res.status(401).send(err.message);
  }
};

const loginHandler = async (req, res) => {
  console.log('Login Handler');
  const userName = req.body.userName;
  const password = req.body.password;
  try {
    const token = await userServices.loginService(userName, password);
    res.send(token);
  }
  catch (err) {
    res.status(401).send(err.message);
  }
};

const tokenValidationHandler = async (req, res) => {
  const token = req.body.token;
  const tokenValidationResp = await userServices.tokenValidationService(token);
  res.send(tokenValidationResp);
};

module.exports = {
  createCredentialsHandler,
  loginHandler,
  tokenValidationHandler,
};