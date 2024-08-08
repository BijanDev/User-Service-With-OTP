const Users = require('../models/User.js');

// Get All User
exports.getAllUser = async (req, res) => {
    try {
        const users = await Users.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json('Internal Server Error');
    }
}

// Get User Profile
exports.getUserProfile = async (req, res) => {
    try {
        const user = await Users.findById(req.params.userId);
        if (!user) {
            res.status(404).json('User not found');
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json('Internal Server Error');
    }
}

// Update User Profile
exports.updateUserProfile = async (req, res) => {
    try {
        const user = await Users.findById(req.params.userId);
        if (!user) {
            res.status(404).json('User not found');
        }
        const updatedUser = await Users.findByIdAndUpdate(req.params.userId, { $set: req.body }, { new: true });
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json('Internal Server Error');
    }
}

// Delete User
exports.deleteUser = async (req, res) => {
    try {
        const user = await Users.findById(req.params.userId);
        if (!user) {
            res.status(404).json('User not found');
        }
        await Users.findByIdAndDelete(req.params.userId);
        res.status(200).json('User deleted successfully');
    } catch (error) {
        res.status(500).json('Internal Server Error');
    }
}
