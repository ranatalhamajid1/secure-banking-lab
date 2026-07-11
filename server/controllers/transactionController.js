const mongoose = require('mongoose');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const AuditLog = require('../models/AuditLog');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const logger = require('../utils/logger');

// ─── Development-only single-instance transfer lock ───
// NOTE: In a multi-instance deployment, replace with a distributed lock (e.g. Redis).
const activeTransfers = new Set();

// ─── Idempotency cache (requestId → response) ───
// TTL: 5 minutes. Prevents duplicate transfers from retries / double-clicks.
const idempotencyCache = new Map();
const IDEMPOTENCY_TTL = 5 * 60 * 1000;

function pruneIdempotencyCache() {
    const now = Date.now();
    for (const [key, entry] of idempotencyCache) {
        if (now - entry.timestamp > IDEMPOTENCY_TTL) {
            idempotencyCache.delete(key);
        }
    }
}
// Prune every 60 seconds
setInterval(pruneIdempotencyCache, 60 * 1000);


// ─── Validation helpers ───
function isValidAmount(amount) {
    if (typeof amount !== 'number') return false;
    if (!Number.isFinite(amount)) return false;
    if (amount <= 0) return false;
    if (amount > 1000000) return false; // Max single transfer: $1,000,000
    return true;
}

function isValidEmail(email) {
    if (typeof email !== 'string') return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function generateReceiptHash(data) {
    const raw = `${data.reference}|${data.transactionId}|${data.amount}|${data.senderEmail}|${data.receiverEmail}|${data.createdAt}`;
    return crypto.createHash('sha256').update(raw).digest('hex');
}


// ═══════════════════════════════════════════════════════
//  TRANSFER MONEY
// ═══════════════════════════════════════════════════════
exports.transferMoney = async (req, res) => {
    const userId = req.user.id;
    const { receiverEmail, amount, pin, requestId } = req.body;

    // ── Step 1: Validate inputs ──
    if (!receiverEmail || amount === undefined || !pin) {
        return res.status(400).json({
            success: false,
            message: 'Receiver, amount, and PIN are required',
            data: null,
            meta: {},
            errors: [{ code: 'PIN_REQUIRED', detail: 'Missing required transfer fields' }]
        });
    }

    if (!requestId || typeof requestId !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'A unique requestId is required for transfer idempotency',
            data: null,
            meta: {},
            errors: [{ code: 'REQUEST_ID_REQUIRED', detail: 'Missing requestId' }]
        });
    }

    const numericAmount = Number(amount);
    if (!isValidAmount(numericAmount)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid transfer amount. Must be a positive number up to $1,000,000.',
            data: null,
            meta: {},
            errors: [{ code: 'INVALID_AMOUNT', detail: 'Amount validation failed' }]
        });
    }

    if (!isValidEmail(receiverEmail)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid receiver email address',
            data: null,
            meta: {},
            errors: [{ code: 'INVALID_EMAIL', detail: 'Email validation failed' }]
        });
    }

    // ── Step 2: Idempotency check ──
    if (idempotencyCache.has(requestId)) {
        const cached = idempotencyCache.get(requestId);
        logger.info('Idempotency hit – returning cached transfer response', { requestId });
        return res.status(cached.statusCode).json(cached.body);
    }

    // ── Step 3: Acquire transfer lock ──
    if (activeTransfers.has(userId)) {
        logger.warn('Transfer lock active – rejecting duplicate request', { userId });
        return res.status(429).json({
            success: false,
            message: 'A transfer is already being processed. Please wait.',
            data: null,
            meta: {},
            errors: [{ code: 'TRANSFER_LOCKED', detail: 'Concurrent transfer blocked' }]
        });
    }

    activeTransfers.add(userId);
    const session = await mongoose.startSession();

    try {
        // ── Step 4: Authenticate user and verify PIN ──
        const [sender, receiver] = await Promise.all([
            User.findById(userId),
            User.findOne({ email: receiverEmail })
        ]);

        if (!sender) {
            return res.status(404).json({
                success: false, message: 'Sender account not found', data: null, meta: {}, errors: []
            });
        }

        if (!sender.transferPinHash) {
            return res.status(400).json({
                success: false,
                message: 'Please set up a Transfer PIN in Security Settings first',
                data: null, meta: {},
                errors: [{ code: 'PIN_REQUIRED', detail: 'No transfer PIN configured' }]
            });
        }

        const isPinValid = await bcrypt.compare(pin, sender.transferPinHash);
        if (!isPinValid) {
            logger.security('Invalid transfer PIN attempt', { userId, receiverEmail });
            return res.status(400).json({
                success: false,
                message: 'Invalid Transfer PIN',
                data: null, meta: {},
                errors: [{ code: 'PIN_REQUIRED', detail: 'PIN mismatch' }]
            });
        }

        if (!receiver) {
            return res.status(404).json({
                success: false, message: 'Receiver not found', data: null, meta: {},
                errors: [{ code: 'RECEIVER_NOT_FOUND', detail: receiverEmail }]
            });
        }

        if (sender.email === receiver.email) {
            return res.status(400).json({
                success: false, message: 'Cannot transfer to yourself', data: null, meta: {},
                errors: [{ code: 'SELF_TRANSFER', detail: 'Sender and receiver are the same' }]
            });
        }

        if (sender.accountBalance < numericAmount) {
            return res.status(400).json({
                success: false, message: 'Insufficient balance', data: null, meta: {},
                errors: [{ code: 'INSUFFICIENT_BALANCE', detail: `Balance: ${sender.accountBalance}` }]
            });
        }

        // ── Step 5: Generate reference & begin MongoDB session ──
        const year = new Date().getFullYear();
        const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase();
        const reference = `SB-${year}-${randomStr}`;
        const transactionId = new mongoose.Types.ObjectId();

        logger.audit('Transfer initiated', { transactionId, reference, amount: numericAmount, sender: sender.email, receiver: receiverEmail });

        // ── Step 6: Create PROCESSING record (outside session so it persists on failure) ──
        const [transaction] = await Transaction.create([{
            _id: transactionId,
            sender: sender._id,
            receiver: receiver._id,
            amount: numericAmount,
            reference,
            status: 'PROCESSING',
            moneyDebited: false
        }]);

        await AuditLog.create({
            user: sender._id,
            action: 'TRANSFER_CREATED',
            ipAddress: req.ip,
            device: req.headers['user-agent'] || 'Unknown',
            details: { transactionId, amount: numericAmount, receiver: receiverEmail, reference, requestId }
        });

        // ── Step 7: Atomic balance transfer inside MongoDB session ──
        try {
            await session.withTransaction(async () => {
                const senderInSession = await User.findById(sender._id).session(session);
                const receiverInSession = await User.findById(receiver._id).session(session);

                senderInSession.accountBalance -= numericAmount;
                receiverInSession.accountBalance += numericAmount;

                await senderInSession.save({ session });
                await receiverInSession.save({ session });

                transaction.moneyDebited = true;
                transaction.status = 'SUCCESS';
                await transaction.save({ session });
            }, { maxCommitTimeMS: 10000 });

            // ── Step 8: Refresh sender balance for receipt ──
            const updatedSender = await User.findById(sender._id).select('accountBalance');
            const senderBalanceAfter = updatedSender.accountBalance;

            // ── Step 9: Generate receipt with integrity hash ──
            const receiptData = {
                reference: transaction.reference,
                transactionId: transaction._id,
                amount: transaction.amount,
                senderEmail: sender.email,
                receiverEmail: receiver.email,
                createdAt: transaction.createdAt.toISOString()
            };
            const receiptHash = generateReceiptHash(receiptData);

            await AuditLog.create({
                user: sender._id,
                action: 'TRANSFER_SUCCESS',
                ipAddress: req.ip,
                device: req.headers['user-agent'] || 'Unknown',
                details: { transactionId, amount: numericAmount, receiver: receiverEmail, reference }
            });

            logger.audit('Transfer successful', { transactionId, reference, amount: numericAmount });

            session.endSession();

            const responseBody = {
                success: true,
                message: 'Transfer successful',
                data: {
                    receipt: {
                        reference: transaction.reference,
                        transactionId: transaction._id,
                        amount: transaction.amount,
                        status: transaction.status,
                        sender: { name: sender.name, email: sender.email },
                        receiver: { name: receiver.name, email: receiver.email },
                        senderBalanceAfter,
                        createdAt: transaction.createdAt,
                        receiptHash,
                        receiptVersion: '1.0.0',
                        generatedBy: 'SecureBank Core Ledger'
                    }
                },
                meta: {},
                errors: []
            };

            // Cache for idempotency
            idempotencyCache.set(requestId, { statusCode: 200, body: responseBody, timestamp: Date.now() });

            return res.status(200).json(responseBody);

        } catch (dbError) {
            // ── Rollback path: mark FAILED ──
            transaction.status = 'FAILED';
            await transaction.save().catch(() => {});

            await AuditLog.create({
                user: sender._id,
                action: 'TRANSFER_FAILED',
                ipAddress: req.ip,
                device: req.headers['user-agent'] || 'Unknown',
                details: { transactionId, amount: numericAmount, receiver: receiverEmail, reference, error: dbError.message }
            });

            logger.error('Transfer failed during MongoDB transaction', { transactionId, error: dbError.message });

            throw dbError; // pass to outer catch
        }

    } catch (err) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        session.endSession();
        logger.error('Transfer error', { userId, error: err.message });

        return res.status(500).json({
            success: false,
            message: 'Server error during transfer',
            data: null,
            meta: {},
            errors: [{ code: 'SERVER_ERROR', detail: err.message }]
        });
    } finally {
        // ── Always release the lock ──
        activeTransfers.delete(userId);
    }
};


// ═══════════════════════════════════════════════════════
//  GET MY TRANSACTIONS
// ═══════════════════════════════════════════════════════
exports.getMyTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({
            $or: [
                { sender: req.user.id },
                { receiver: req.user.id }
            ]
        })
            .populate('sender', 'name email')
            .populate('receiver', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: 'Transactions retrieved',
            data: { transactions },
            meta: { count: transactions.length },
            errors: []
        });
    } catch (err) {
        logger.error('Failed to fetch transactions', { userId: req.user.id, error: err.message });
        res.status(500).json({
            success: false,
            message: 'Server error',
            data: null,
            meta: {},
            errors: [{ code: 'SERVER_ERROR', detail: err.message }]
        });
    }
};