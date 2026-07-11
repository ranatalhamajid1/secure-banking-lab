const express = require('express');

const router = express.Router();


const { protect } = require('../middleware/authMiddleware');

const { adminOnly } = require('../middleware/adminMiddleware');


const {
    getUsers,
    getTransactions,
    getCards,
    getAuditLogs
} = require('../controllers/adminController');



// all users

router.get(
    '/users',
    protect,
    adminOnly,
    getUsers
);



// all transactions

router.get(
    '/transactions',
    protect,
    adminOnly,
    getTransactions
);

router.get(
    '/cards',
    protect,
    adminOnly,
    getCards
);

router.get(
    '/audit-logs',
    protect,
    adminOnly,
    getAuditLogs
);

module.exports = router;