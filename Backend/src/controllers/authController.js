const User = require('../models/User');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const authController = {
    register: async (req, res) => {
        try {
            const { email, password, reEnterPassword } = req.body;

            // Check if passwords match
            if (password !== reEnterPassword) {
                return res.status(400).json({ error: 'Passwords do not match' });
            }

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ error: 'User already exists' });
            }

            const hashedPassword = await bcryptjs.hash(password, 10);

            const newUser = new User({
                email,
                password: hashedPassword,
                reEnterPassword: hashedPassword,
            });

            await newUser.save();

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: 'haradyash0244@gmail.com',
                    pass: 'vfkx jwxb xacc rjwo'
                }
            });

            const mailOptions = {
                from: 'haradyash0244@gmail.com',
                to: email,
                subject: 'Welcome to YourApp',
                html: `
                    <p>Thank you for registering with Yatra Sahayak!</p>
                    <p>Your account has been successfully created.</p>
                `
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error(error);
                    return res.status(500).json({ message: 'Failed to send welcome email' });
                }
                console.log('Email sent: ' + info.response);
                res.status(201).json({ message: 'User registered successfully. Welcome email sent.' });
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to register user' });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const isPasswordValid = await bcryptjs.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const token = jwt.sign({ userId: user._id, email: user.email }, 'myPizza');

            res.status(200).json({ token });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to log in' });
        }
    },

    forgotPassword: async (req, res) => {
        try {
            const { email } = req.body;

            const user = await User.findOne({ email });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Send password reset link via email (you can customize this part)
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: 'haradyash0244@gmail.com',
                    pass: 'vfkx jwxb xacc rjwo'
                }
            });

            const mailOptions = {
                from: 'haradyash0244@gmail.com',
                to: email,
                subject: 'Password Reset Link',
                html: `
                    <p>You have requested to reset your password.</p>
                    <p>Click the following link to reset your password:</p>
                    <a href="http://localhost:3000/reset-password/${user._id}">Reset Password</a>
                `
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error(error);
                    return res.status(500).json({ message: 'Failed to send password reset link' });
                }
                console.log('Email sent: ' + info.response);
                res.status(200).json({ message: 'Password reset link sent successfully' });
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to send password reset link' });
        }
    },

    resetPassword: async (req, res) => {
        try {
            const { userId, newPassword, reEnterPassword } = req.body;

            // Validate the new password and re-entered password
            if (newPassword !== reEnterPassword) {
                return res.status(400).json({ message: 'Passwords do not match' });
            }

            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const hashedPassword = await bcryptjs.hash(newPassword, 10);
            user.password = hashedPassword;

            await user.save();

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: 'haradyash0244@gmail.com',
                    pass: 'vfkx jwxb xacc rjwo'
                }
            });

            const mailOptions = {
                from: 'haradyash0244@gmail.com',
                to: user.email,
                subject: 'Password Changed',
                html: `
                    <p>Your password has been successfully changed.</p>
                    <p>If you did not initiate this change, please contact support.</p>
                `
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error(error);
                    return res.status(500).json({ message: 'Failed to send password changed email' });
                }
                console.log('Email sent: ' + info.response);
                res.status(200).json({ message: 'Password reset successfully' });
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to reset password' });
        }
    },
};

module.exports = authController;
