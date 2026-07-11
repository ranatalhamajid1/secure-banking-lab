const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const Device = require('../models/Device');
const crypto = require('crypto');
const { authenticator } = require('otplib');
const qrcode = require('qrcode');

// REGISTER
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        const accessToken = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        user.refreshToken = refreshToken;
        await user.save();

        res.cookie('token', accessToken, {
            httpOnly: true,
            secure: false, // true in prod
            sameSite: 'strict'
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false, // true in prod
            sameSite: 'strict'
        });

        res.status(201).json({
            message: 'User registered successfully',
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// LOGIN
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            await AuditLog.create({
                user: user._id,
                action: 'LOGIN_FAILED',
                ipAddress: req.ip,
                device: req.headers['user-agent'] || 'Unknown',
                details: { reason: 'Invalid password' }
            });
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const userAgent = req.headers['user-agent'] || 'Unknown';
        
        // Log Device
        let device = await Device.findOne({ user: user._id, ip: req.ip, browser: userAgent });
        if (!device) {
            device = await Device.create({
                user: user._id,
                ip: req.ip,
                browser: userAgent,
                deviceName: userAgent.split(' ')[0] || 'Unknown Device'
            });
        } else {
            device.lastLogin = Date.now();
            await device.save();
        }

        if (user.twoFactorEnabled) {
            return res.status(200).json({
                message: '2FA required',
                requires2FA: true,
                userId: user._id
            });
        }

        const accessToken = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        user.refreshToken = refreshToken;
        await user.save();

        res.cookie('token', accessToken, {
            httpOnly: true,
            secure: false, // true in prod
            sameSite: 'strict'
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false, // true in prod
            sameSite: 'strict'
        });

        await AuditLog.create({
            user: user._id,
            action: 'LOGIN_SUCCESS',
            ipAddress: req.ip,
            device: req.headers['user-agent'] || 'Unknown'
        });

        res.status(200).json({
            message: 'Login successful',
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
// Logout
exports.logout = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
            if (decoded && decoded.id) {
                await User.findByIdAndUpdate(decoded.id, { refreshToken: null });
                
                await AuditLog.create({
                    user: decoded.id,
                    action: 'LOGOUT',
                    ipAddress: req.ip,
                    device: req.headers['user-agent'] || 'Unknown'
                });
            }
        }
    } catch (err) {
        // Ignore token errors on logout
    }

    res.clearCookie('token');
    res.clearCookie('refreshToken');
    res.status(200).json({ message: 'Logged out successfully' });
};

// Refresh Token
exports.refresh = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;
        
        if (!refreshToken) {
            return res.status(401).json({ message: 'No refresh token provided' });
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        const newAccessToken = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        res.cookie('token', newAccessToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict'
        });

        res.status(200).json({ message: 'Token refreshed' });
    } catch (error) {
        console.error('Refresh Token Error:', error);
        res.status(401).json({ message: 'Invalid refresh token' });
    }
};

// Setup 2FA
exports.setup2FA = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        const secret = authenticator.generateSecret();
        const otpauthUrl = authenticator.keyuri(user.email, 'SecureBank', secret);
        
        user.twoFactorSecret = secret;
        user.twoFactorEnabled = true;
        await user.save();

        const qrCodeUrl = await qrcode.toDataURL(otpauthUrl);

        res.status(200).json({
            message: '2FA enabled successfully',
            secret: secret,
            qrCode: qrCodeUrl
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Verify 2FA
exports.verify2FA = async (req, res) => {
    try {
        const { userId, code } = req.body;
        const user = await User.findById(userId);

        if (!user || !user.twoFactorEnabled) {
            return res.status(400).json({ message: 'Invalid request' });
        }

        const isValid = authenticator.verify({ token: code, secret: user.twoFactorSecret });
        
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid 2FA code' });
        }

        const accessToken = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        user.refreshToken = refreshToken;
        await user.save();

        res.cookie('token', accessToken, {
            httpOnly: true,
            secure: false, // true in prod
            sameSite: 'strict'
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false, // true in prod
            sameSite: 'strict'
        });

        res.status(200).json({
            message: 'Login successful',
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};