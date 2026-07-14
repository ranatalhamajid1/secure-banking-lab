class ApiResponse {
    static success(res, message, data = null, statusCode = 200, meta = null) {
        const response = {
            success: true,
            message,
            data,
        };
        if (meta) response.meta = meta;
        
        return res.status(statusCode).json(response);
    }

    static error(res, message, statusCode = 500, errors = []) {
        return res.status(statusCode).json({
            success: false,
            message,
            data: null,
            errors,
        });
    }
}

module.exports = ApiResponse;
