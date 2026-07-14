const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { authenticator } = require('otplib');
const qrcode = require('qrcode');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const Device = require('../models/Device');

class AuthService {
    /**
     * Generates Access and Refresh Tokens, sets them as cookies, and updates the DB.
     */
    static async generateAndSetTokens(user, res) {
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

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        };

        res.cookie('token', accessToken, cookieOptions);
        res.cookie('refreshToken', refreshToken, cookieOptions);

        return { accessToken, refreshToken };
    }

    static async register(name, email, password) {
        const cleanEmail = String(email).toLowerCase().trim();
        const existingUser = await User.findOne({ email: cleanEmail });
        
        if (existingUser) {
            const error = new Error('Email already registered');
            error.statusCode = 400;
            throw error;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email: cleanEmail,
            password: hashedPassword,
        });

        return user;
    }

    static async login(email, password, ipAddress, userAgent) {
        const cleanEmail = String(email).toLowerCase().trim();
        const user = await User.findOne({ email: cleanEmail });
        
        if (!user) {
            const error = new Error('Invalid credentials');
            error.statusCode = 401;
            throw error;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            await AuditLog.create({
                user: user._id,
                action: 'LOGIN_FAILED',
                ipAddress,
                device: userAgent,
                details: { reason: 'Invalid password' }
            });
            const error = new Error('Invalid credentials');
            error.statusCode = 401;
            throw error;
        }

        // Log Device
        let device = await Device.findOne({ user: user._id, ip: ipAddress, browser: userAgent });
        if (!device) {
            await Device.create({
                user: user._id,
                ip: ipAddress,
                browser: userAgent,
                deviceName: userAgent.split(' ')[0] || 'Unknown Device'
            });
        } else {
            device.lastLogin = Date.now();
            await device.save();
        }

        if (user.twoFactorEnabled) {
            const tempToken = jwt.sign(
                { id: user._id, isTemp: true },
                process.env.JWT_SECRET,
                { expiresIn: '5m' }
            );
            return { requires2FA: true, tempToken };
        }

        await AuditLog.create({
            user: user._id,
            action: 'LOGIN_SUCCESS',
            ipAddress,
            device: userAgent
        });

        return { requires2FA: false, user };
    }

    static async setup2FA(userId) {
        const user = await User.findById(userId);
        const secret = authenticator.generateSecret();
        const otpauthUrl = authenticator.keyuri(user.email, 'SecureBank', secret);
        
        // Save pending secret. DO NOT enable 2FA yet to prevent lockout.
        user.twoFactorSecretPending = secret;
        await user.save();

        const qrCodeUrl = await qrcode.toDataURL(otpauthUrl);
        return { secret, qrCodeUrl };
    }

    static async confirm2FA(userId, code) {
        const user = await User.findById(userId);
        
        if (!user.twoFactorSecretPending) {
            const error = new Error('No 2FA setup in progress');
            error.statusCode = 400;
            throw error;
        }

        const isValid = authenticator.verify({ token: code, secret: user.twoFactorSecretPending });
        
        if (!isValid) {
            const error = new Error('Invalid 2FA code');
            error.statusCode = 401;
            throw error;
        }

        user.twoFactorSecret = user.twoFactorSecretPending;
        user.twoFactorSecretPending = undefined;
        user.twoFactorEnabled = true;
        await user.save();

        return user;
    }

    static async verify2FA(tempToken, code) {
        let decoded;
        try {
            decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
        } catch (err) {
            const error = new Error('Session expired or invalid');
            error.statusCode = 401;
            throw error;
        }
        
        if (!decoded.isTemp) {
            const error = new Error('Invalid token type');
            error.statusCode = 401;
            throw error;
        }

        const user = await User.findById(decoded.id);

        if (!user || !user.twoFactorEnabled) {
            const error = new Error('Invalid request');
            error.statusCode = 400;
            throw error;
        }

        const isValid = authenticator.verify({ token: code, secret: user.twoFactorSecret });
        
        if (!isValid) {
            const error = new Error('Invalid 2FA code');
            error.statusCode = 401;
            throw error;
        }

        return user;
    }

    static async refresh(refreshToken) {
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user || user.refreshToken !== refreshToken) {
            const error = new Error('Invalid refresh token');
            error.statusCode = 401;
            throw error;
        }

        return user;
    }

    static async logout(token, ipAddress, userAgent) {
        if (!token) return;
        
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
            if (decoded && decoded.id) {
                await User.findByIdAndUpdate(decoded.id, { refreshToken: null });
                await AuditLog.create({
                    user: decoded.id,
                    action: 'LOGOUT',
                    ipAddress,
                    device: userAgent
                });
            }
        } catch (err) {
            // Ignore token parsing errors during logout
        }
    }
}

module.exports = AuthService;
