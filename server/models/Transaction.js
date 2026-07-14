const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({

    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
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
    },
    
    requestId: {
        type: String,
        unique: true,
        sparse: true
    }

}, { timestamps: true });


module.exports = mongoose.model(
    'Transaction',
    transactionSchema
);