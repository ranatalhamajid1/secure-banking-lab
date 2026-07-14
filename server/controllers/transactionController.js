const TransactionService = require('../services/TransactionService');
const ApiResponse = require('../utils/ApiResponse');
const logger = require('../utils/logger');

// ═══════════════════════════════════════════════════════
//  TRANSFER MONEY
// ═══════════════════════════════════════════════════════
exports.transferMoney = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { receiverEmail, amount, pin, requestId } = req.body;
        
        if (!receiverEmail || amount === undefined || !pin) {
            const error = new Error('Receiver, amount, and PIN are required');
            error.statusCode = 400;
            throw error;
        }

        if (!requestId || typeof requestId !== 'string') {
            const error = new Error('A unique requestId is required');
            error.statusCode = 400;
            throw error;
        }

        const ipAddress = req.ip;
        const userAgent = req.headers['user-agent'] || 'Unknown';

        const data = await TransactionService.transferMoney(
            userId, 
            receiverEmail, 
            amount, 
            pin, 
            requestId, 
            ipAddress, 
            userAgent
        );

        return ApiResponse.success(res, 'Transfer successful', data);
    } catch (err) {
        next(err);
    }
};

// ═══════════════════════════════════════════════════════
//  GET MY TRANSACTIONS
// ═══════════════════════════════════════════════════════
exports.getMyTransactions = async (req, res, next) => {
    try {
        const transactions = await TransactionService.getMyTransactions(req.user.id);

        return ApiResponse.success(
            res, 
            'Transactions retrieved', 
            { transactions }, 
            200, 
            { count: transactions.length }
        );
    } catch (err) {
        logger.error('Failed to fetch transactions', { userId: req.user.id, error: err.message });
        next(err);
    }
};