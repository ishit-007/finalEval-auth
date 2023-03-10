const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');


router.post('/user', userController.createCredentialsHandler);

router.post('/login', userController.loginHandler);

router.post('/token/validate', userController.tokenValidationHandler);

module.exports = router;
