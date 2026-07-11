const User = require('../models/User');
const Transaction = require('../models/Transaction');
const VirtualCard = require('../models/VirtualCard');
const AuditLog = require('../models/AuditLog');


// GET ALL USERS

exports.getUsers = async (req, res) => {

    try {

        const users = await User.find()
            .select('-password');


        res.status(200).json({
            users
        });


    } catch (err) {

        res.status(500).json({
            message: 'Server error'
        });

    }

};


// GET ALL TRANSACTIONS

exports.getTransactions = async (req, res) => {

    try {

        const transactions = await Transaction.find()
            .populate('sender', 'name email')
            .populate('receiver', 'name email');


        res.status(200).json({
            transactions
        });


    } catch (err) {
        res.status(500).json({
            message: 'Server error'
        });
    }
};

// GET ALL CARDS
exports.getCards = async (req, res) => {
    try {
        const cards = await VirtualCard.find().populate('user', 'name email');
        res.status(200).json({ cards });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// GET AUDIT LOGS
exports.getAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(100);
        res.status(200).json({ logs });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};