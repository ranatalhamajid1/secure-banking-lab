const rateLimit = require('express-rate-limit');

// 50 attempts per 15 minutes for login (increased for testing)
exports.loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: { message: 'Too many login attempts from this IP, please try again after 15 minutes' }
});

// 20 attempts per 15 minutes for sensitive routes (e.g. transfers, setting PIN, revealing CVV)
exports.sensitiveLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { message: 'Too many requests for sensitive operations, please try again later' }
});

// 100 requests per 1 minute for all other API routes
exports.apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    message: { message: 'Too many requests from this IP, please try again after a minute' }
});
