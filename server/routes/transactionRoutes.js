const express = require('express');

const router = express.Router();


const { protect } = require('../middleware/authMiddleware');

const {
    transferMoney,
    getMyTransactions
} = require('../controllers/transactionController');

// transfer

router.post('/transfer', protect, transferMoney);

router.get(
    '/history',
    protect,
    getMyTransactions
);

module.exports = router;