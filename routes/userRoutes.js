const express = require('express');
const { getAllUser, getUserProfile, updateUserProfile, deleteUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const userRouter = express.Router();

userRouter.get('/users', protect, getAllUser);
userRouter.get('/users/:userId', protect, getUserProfile);
userRouter.put('/users/:userId', protect, updateUserProfile);
userRouter.delete('/users/:userId', protect, deleteUser);

module.exports = userRouter;