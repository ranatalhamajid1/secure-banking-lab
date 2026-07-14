const { v4: uuidv4 } = require('crypto');

/**
 * Request ID Middleware
 * 
 * Assigns a unique x-request-id to every incoming request for tracing.
 * If the client sends one, it is preserved. Otherwise, a UUID is generated.
 */
const requestIdMiddleware = (req, res, next) => {
    const requestId = req.headers['x-request-id'] || generateRequestId();
    req.requestId = requestId;
    res.setHeader('x-request-id', requestId);
    next();
};

/**
 * Response Time Middleware
 * 
 * Tracks and logs the time taken to process each request.
 * Sets X-Response-Time header for observability.
 */
const responseTimeMiddleware = (req, res, next) => {
    const startTime = process.hrtime.bigint();

    // Override writeHead to set header before it is sent to the client
    const originalWriteHead = res.writeHead;
    res.writeHead = function (...args) {
        const endTime = process.hrtime.bigint();
        const durationMs = Number(endTime - startTime) / 1e6;
        res.setHeader('X-Response-Time', `${durationMs.toFixed(2)}ms`);
        return originalWriteHead.apply(this, args);
    };

    res.on('finish', () => {
        const endTime = process.hrtime.bigint();
        const durationMs = Number(endTime - startTime) / 1e6;

        const logger = require('../utils/logger');
        logger.info('Request completed', {
            requestId: req.requestId,
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration: `${durationMs.toFixed(2)}ms`,
            userAgent: req.headers['user-agent']?.substring(0, 50) || 'Unknown',
        });
    });

    next();
};

function generateRequestId() {
    // Crypto-safe unique ID
    const bytes = require('crypto').randomBytes(16);
    return [
        bytes.toString('hex', 0, 4),
        bytes.toString('hex', 4, 6),
        bytes.toString('hex', 6, 8),
        bytes.toString('hex', 8, 10),
        bytes.toString('hex', 10, 16),
    ].join('-');
}

module.exports = { requestIdMiddleware, responseTimeMiddleware };
