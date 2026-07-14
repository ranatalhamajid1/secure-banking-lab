const ApiResponse = require('../utils/ApiResponse');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    logger.error('Unhandled Error:', {
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip
    });

    const statusCode = err.statusCode || 500;
    const message = statusCode === 500 ? 'Internal Server Error' : err.message;
    const errors = err.errors || [];

    return ApiResponse.error(res, message, statusCode, errors);
};

module.exports = { errorHandler };
