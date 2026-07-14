const CardService = require('../services/CardService');
const ApiResponse = require('../utils/ApiResponse');
const { validationResult } = require('express-validator');

exports.createCard = async (req, res, next) => {
    try {
        const ipAddress = req.ip;
        const userAgent = req.headers['user-agent'] || 'Unknown';
        
        const cardData = await CardService.createCard(req.user.id, ipAddress, userAgent);
        return ApiResponse.success(res, 'Virtual card created successfully', { card: cardData }, 201);
    } catch (err) {
        next(err);
    }
};

exports.getUserCards = async (req, res, next) => {
    try {
        const cards = await CardService.getUserCards(req.user.id);
        return ApiResponse.success(res, 'Cards retrieved successfully', cards);
    } catch (err) {
        next(err);
    }
};

exports.freezeCard = async (req, res, next) => {
    try {
        const { id } = req.params;
        const ipAddress = req.ip;
        const userAgent = req.headers['user-agent'] || 'Unknown';

        const card = await CardService.freezeCard(req.user.id, id, ipAddress, userAgent);
        return ApiResponse.success(res, `Card is now ${card.status}`, { card: { _id: card._id, status: card.status } });
    } catch (err) {
        next(err);
    }
};

exports.updatePermissions = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed');
        error.statusCode = 400;
        error.errors = errors.array();
        return next(error);
    }

    try {
        const { id } = req.params;
        const { permissions, spendingLimit } = req.body;
        const ipAddress = req.ip;
        const userAgent = req.headers['user-agent'] || 'Unknown';

        const card = await CardService.updatePermissions(req.user.id, id, permissions, spendingLimit, ipAddress, userAgent);
        
        return ApiResponse.success(res, 'Card updated successfully', { 
            permissions: card.permissions, 
            spendingLimit: card.spendingLimit 
        });
    } catch (err) {
        next(err);
    }
};

exports.revealCVV = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { pin } = req.body;
        const ipAddress = req.ip;
        const userAgent = req.headers['user-agent'] || 'Unknown';

        const data = await CardService.revealCVV(req.user.id, id, pin, ipAddress, userAgent);
        return ApiResponse.success(res, 'CVV revealed successfully', data);
    } catch (err) {
        // Pass the cardDeleted flag if the card was corrupted
        if (err.cardDeleted) {
            return res.status(400).json({
                success: false,
                message: err.message,
                cardDeleted: true
            });
        }
        next(err);
    }
};
