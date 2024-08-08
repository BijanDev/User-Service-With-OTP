const User = require('../models/User.js');
const jwt = require('jsonwebtoken');
const bycrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { generateNumericOTP } = require('../OTP/otpService.js');

const secretkey = process.env.SECRET_KEY;
const otpStore = {}; // Store OTPs

const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.google.com",
    port: 465,
    secure: true, // Use `true` for port 465, `false` for all other ports
    auth: {
        user: "bijanroy150@gmail.com",
        pass: "kgbj slhj zqsa jwfa",
    },
});

// User Registration
exports.register = async (req, res) => {
    try {
        const user = new User(req.body);
        const existingUser = await User.findOne({ $or: [{ phoneNo: req.body.phoneNo }, { email: req.body.email }] });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }
        const savedUser = await user.save();
        res.status(201).json({ message: 'User created successfully', user: savedUser });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// User Login
exports.login = async (req, res) => {
    try {
        const { phoneNo, password } = req.body;
        const user = await User.findOne({ phoneNo });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bycrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ userId: user._id, phoneNo: user.phoneNo, email: user.email, name: user.name }, secretkey, { expiresIn: '24h' });
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// Forgot Password
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        const token = jwt.sign({ email_id: email }, secretkey, { expiresIn: '1h' });

        const otp = generateNumericOTP(token);
        console.log(otp);

        // Store OTP in the in-memory store with a timestamp
        otpStore[email] = { otp, timestamp: Date.now() };

        console.log('Current OTP Store:', otpStore);

        // Send the OTP to the user's email
        const mailOptions = {
            from: 'bijanroy150@gmail.com',
            to: email,
            subject: 'Reset Password',
            // text: `Click the link below to reset your password: ${otp}`,
            html: `<body style="font-family: Arial, sans-serif; line-height: 1.6em;">
                        <h2>Password Reset</h2>
                        <p>Hello,</p>
                        <p>You have requested to reset your password. Please use the OTP below:</p>
                        <p style="font-size: 1.2em; padding: 10px 20px; background-color: #f0f0f0;">${otp}</p>
                        <p>If you did not request this password reset, please ignore this email.</p>
                        <p>Thank you!</p>
                    </body>`,
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
                res.status(200).json({ message: 'Email sent with reset instructions' });
            }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// Reset Password
exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Retrieve stored OTP
        const storedData = otpStore[email];
        console.log('Retrieved OTP Data:', storedData); // Log the stored data

        if (!storedData) {
            return res.status(400).json({ message: 'No OTP found for this email' });
        } else if (Date.now() - storedData.timestamp > 60000) {
            if (currentTime - storedData.timestamp > otpExpiryTime) {
                delete otpStore[email]; // Remove expired OTP
                console.log('Expired OTP Store:', otpStore); // Log after removal
                return res.status(400).json({ message: 'OTP has expired' });
            }
        }

        // Verify the OTP
        if (otp !== storedData.otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        } else {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ message: 'User not found' });
            }
            const salt = await bycrypt.genSalt(10);
            const hashedPassword = await bycrypt.hash(newPassword, salt);
            const updateResult = await User.updateOne({ email }, { $set: { password: hashedPassword } });
            if (updateResult.nModified === 0) {
                return res.status(400).json({ message: 'Password reset failed' });
            }
            res.status(200).json({ message: 'Password reset successful' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}
