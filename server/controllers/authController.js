const AuthService = require('../services/AuthService');
const ApiResponse = require('../utils/ApiResponse');
const logger = require('../utils/logger');

// REGISTER
exports.register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
            const error = new Error('Invalid input types');
            error.statusCode = 400;
            throw error;
        }

        const user = await AuthService.register(name, email, password);
        await AuthService.generateAndSetTokens(user, res);

        return ApiResponse.success(res, 'User registered successfully', {
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        }, 201);
    } catch (err) {
        next(err);
    }
};

// LOGIN
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const ipAddress = req.ip;
        const userAgent = req.headers['user-agent'] || 'Unknown';

        if (typeof email !== 'string' || typeof password !== 'string') {
            const error = new Error('Invalid input types');
            error.statusCode = 400;
            throw error;
        }

        const result = await AuthService.login(email, password, ipAddress, userAgent);

        if (result.requires2FA) {
            return ApiResponse.success(res, '2FA required', {
                requires2FA: true,
                tempToken: result.tempToken
            });
        }

        await AuthService.generateAndSetTokens(result.user, res);

        return ApiResponse.success(res, 'Login successful', {
            user: { 
                id: result.user._id, 
                name: result.user.name, 
                email: result.user.email, 
                role: result.user.role 
            }
        });
    } catch (err) {
        next(err);
    }
};

// LOGOUT
exports.logout = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        const ipAddress = req.ip;
        const userAgent = req.headers['user-agent'] || 'Unknown';

        await AuthService.logout(token, ipAddress, userAgent);

        res.clearCookie('token');
        res.clearCookie('refreshToken');
        
        return ApiResponse.success(res, 'Logged out successfully');
    } catch (err) {
        next(err);
    }
};

// REFRESH
exports.refresh = async (req, res, next) => {
    try {
        const { refreshToken } = req.cookies;
        
        if (!refreshToken) {
            const error = new Error('No refresh token provided');
            error.statusCode = 401;
            throw error;
        }

        const user = await AuthService.refresh(refreshToken);
        await AuthService.generateAndSetTokens(user, res);

        return ApiResponse.success(res, 'Token refreshed');
    } catch (err) {
        logger.error('Refresh Token Error:', err);
        const error = new Error('Invalid refresh token');
        error.statusCode = 401;
        next(error);
    }
};

// SETUP 2FA (Start)
exports.setup2FA = async (req, res, next) => {
    try {
        const result = await AuthService.setup2FA(req.user.id);
        
        return ApiResponse.success(res, '2FA setup initiated', {
            secret: result.secret,
            qrCode: result.qrCodeUrl
        });
    } catch (err) {
        next(err);
    }
};

// CONFIRM 2FA (New)
exports.confirm2FA = async (req, res, next) => {
    try {
        const { code } = req.body;
        
        if (!code) {
            const error = new Error('Verification code is required');
            error.statusCode = 400;
            throw error;
        }

        const user = await AuthService.confirm2FA(req.user.id, code);
        
        return ApiResponse.success(res, '2FA enabled successfully');
    } catch (err) {
        next(err);
    }
};

// VERIFY 2FA (During Login)
exports.verify2FA = async (req, res, next) => {
    try {
        const { tempToken, code } = req.body;
        
        if (!tempToken || !code) {
            const error = new Error('Session and verification code required');
            error.statusCode = 400;
            throw error;
        }

        const user = await AuthService.verify2FA(tempToken, code);
        await AuthService.generateAndSetTokens(user, res);

        return ApiResponse.success(res, 'Login successful', {
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        next(err);
    }
};