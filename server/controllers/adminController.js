const User = require('../models/User');
const Transaction = require('../models/Transaction');
const VirtualCard = require('../models/VirtualCard');
const AuditLog = require('../models/AuditLog');

// Helper for pagination
const getPagination = (req) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50; // Default 50 items per page
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};

// GET ALL USERS
exports.getUsers = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req);
        const total = await User.countDocuments();
        
        // Fix Data Leakage: exclude 2FA and transfer pin secrets
        const users = await User.find()
            .select('-password -twoFactorSecret -transferPin')
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            users,
            pagination: { total, page, limit, pages: Math.ceil(total / limit) }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// GET ALL TRANSACTIONS
exports.getTransactions = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req);
        const total = await Transaction.countDocuments();

        const transactions = await Transaction.find()
            .populate('sender', 'name email')
            .populate('receiver', 'name email')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        res.status(200).json({
            transactions,
            pagination: { total, page, limit, pages: Math.ceil(total / limit) }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// GET ALL CARDS
exports.getCards = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req);
        const total = await VirtualCard.countDocuments();

        const cards = await VirtualCard.find()
            .populate('user', 'name email')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        res.status(200).json({ 
            cards,
            pagination: { total, page, limit, pages: Math.ceil(total / limit) }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// GET AUDIT LOGS
exports.getAuditLogs = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req);
        const total = await AuditLog.countDocuments();

        const logs = await AuditLog.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({ 
            logs,
            pagination: { total, page, limit, pages: Math.ceil(total / limit) }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};