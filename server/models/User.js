const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    accountBalance: {
        type: Number,
        default: 1000, // starting balance for demo purposes
    },
    refreshToken: {
        type: String,
        default: null,
    },
    twoFactorEnabled: {
        type: Boolean,
        default: false,
    },
    twoFactorSecret: {
        type: String,
        default: null,
    },
    twoFactorSecretPending: {
        type: String,
        default: null,
    },
    transferPinHash: {
        type: String,
        default: null,
    },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);