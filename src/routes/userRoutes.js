const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');


router.get('/', (req, res) => {
  res.send('Hello World!');
});

router.post('/user', userController.createCredentialsHandler);
router.post('/login', userController.loginHandler);
router.post('/token/validate', userController.tokenValidationHandler);

module.exports = router;
