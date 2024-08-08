const express = require('express');
const { register, login, forgotPassword, resetPassword } = require('../controllers/authController');
const authRouter = express.Router();

authRouter.post('/users/register', register);
authRouter.post('/users/login', login);
authRouter.post('/users/forgot-password', forgotPassword);
authRouter.post('/users/reset-password', resetPassword);

module.exports = authRouter;