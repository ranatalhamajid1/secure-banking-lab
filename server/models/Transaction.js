const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({

    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    amount: {
        type: Number,
        required: true
    },

    reference: {
        type: String,
        unique: true
    },

    moneyDebited: {
        type: Boolean,
        default: false
    },

    status: {
        type: String,
        enum: ['PROCESSING', 'SUCCESS', 'FAILED', 'REFUNDED', 'success', 'failed', 'pending'],
        default: 'PROCESSING'
    }

}, { timestamps: true });


module.exports = mongoose.model(
    'Transaction',
    transactionSchema
);