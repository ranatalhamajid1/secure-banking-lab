const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const virtualCardSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    cardHolderName: {
        type: String,
        required: true
    },
    cardNumber: {
        type: String,
        required: true
    },
    maskedNumber: {
        type: String,
        required: true
    },
    expiryDate: {
        type: String,
        required: true
    },
    cvv: {
        type: String,
        required: true
    },
    cardType: {
        type: String,
        enum: ['virtual', 'physical'],
        default: 'virtual'
    },
    status: {
        type: String,
        enum: ['active', 'frozen', 'cancelled'],
        default: 'active'
    },
    permissions: {
        onlinePayments: { type: Boolean, default: true },
        internationalTransactions: { type: Boolean, default: false },
        atmWithdrawals: { type: Boolean, default: false },
        posPayments: { type: Boolean, default: true }
    },
    spendingLimit: {
        daily: { type: Number, default: 1000 },
        monthly: { type: Number, default: 10000 }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Removed empty pre-save hook that was causing next() issues

module.exports = mongoose.model('VirtualCard', virtualCardSchema);
