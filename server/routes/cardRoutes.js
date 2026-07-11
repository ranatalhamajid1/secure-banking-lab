const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createCard, getUserCards, freezeCard, updatePermissions, revealCVV } = require('../controllers/cardController');
const { body } = require('express-validator');
const { sensitiveLimiter } = require('../middleware/rateLimiter');

// Protect all card routes
router.use(protect);

router.post('/create', createCard);

router.get('/', getUserCards);

router.patch('/:id/freeze', freezeCard);

router.patch('/:id/permissions', [
    body('permissions').optional().isObject().withMessage('Permissions must be an object'),
    body('spendingLimit').optional().isObject().withMessage('Spending limit must be an object'),
    body('spendingLimit.daily').optional().isNumeric(),
    body('spendingLimit.monthly').optional().isNumeric(),
], updatePermissions);

router.post('/:id/reveal-cvv', sensitiveLimiter, revealCVV);

module.exports = router;
