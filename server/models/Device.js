const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    deviceName: {
        type: String,
        default: 'Unknown Device'
    },
    browser: {
        type: String,
        default: 'Unknown Browser'
    },
    ip: {
        type: String,
        required: true
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    trusted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Device', deviceSchema);
