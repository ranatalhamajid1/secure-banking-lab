const mongoose = require('mongoose');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const AuditLog = require('../models/AuditLog');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const logger = require('../utils/logger');

class TransactionService {
    static isValidAmount(amount) {
        return typeof amount === 'number' && amount > 0 && Number.isFinite(amount);
    }
    
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static generateReceiptHash(data) {
        return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
    }

    static async transferMoney(userId, receiverEmail, amount, pin, requestId, ipAddress, userAgent) {
        const numericAmount = Number(amount);
        
        if (!this.isValidAmount(numericAmount)) {
            const error = new Error('Invalid transfer amount');
            error.statusCode = 400;
            throw error;
        }

        if (!this.isValidEmail(receiverEmail)) {
            const error = new Error('Invalid receiver email');
            error.statusCode = 400;
            throw error;
        }

        // Idempotency Check
        let existingTx = await Transaction.findOne({ requestId }).populate('sender').populate('receiver');
        if (existingTx) {
            if (existingTx.status === 'SUCCESS') {
                const receiptData = {
                    reference: existingTx.reference,
                    transactionId: existingTx._id,
                    amount: existingTx.amount,
                    senderEmail: existingTx.sender.email,
                    receiverEmail: existingTx.receiver.email,
                    createdAt: existingTx.createdAt.toISOString()
                };
                return {
                    receipt: {
                        reference: existingTx.reference,
                        transactionId: existingTx._id,
                        amount: existingTx.amount,
                        status: existingTx.status,
                        sender: { name: existingTx.sender.name, email: existingTx.sender.email },
                        receiver: { name: existingTx.receiver.name, email: existingTx.receiver.email },
                        senderBalanceAfter: existingTx.sender.accountBalance,
                        createdAt: existingTx.createdAt,
                        receiptHash: this.generateReceiptHash(receiptData),
                        receiptVersion: '1.0.0',
                        generatedBy: 'SecureBank Core Ledger'
                    }
                };
            }
            const error = new Error('A previous transfer attempt with this ID failed or is processing');
            error.statusCode = 400;
            throw error;
        }

        const [sender, receiver] = await Promise.all([
            User.findById(userId),
            User.findOne({ email: receiverEmail })
        ]);

        if (!sender || !receiver) {
            const error = new Error('Sender or receiver not found');
            error.statusCode = 404;
            throw error;
        }

        if (sender._id.equals(receiver._id)) {
            const error = new Error('Cannot transfer to yourself');
            error.statusCode = 400;
            throw error;
        }

        if (!sender.transferPinHash) {
            const error = new Error('Please set up a Transfer PIN');
            error.statusCode = 400;
            throw error;
        }

        const isPinValid = await bcrypt.compare(pin, sender.transferPinHash);
        if (!isPinValid) {
            const error = new Error('Invalid Transfer PIN');
            error.statusCode = 400;
            throw error;
        }

        if (sender.accountBalance < numericAmount) {
            const error = new Error('Insufficient balance');
            error.statusCode = 400;
            throw error;
        }

        const year = new Date().getFullYear();
        const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase();
        const reference = `SB-${year}-${randomStr}`;
        const transactionId = new mongoose.Types.ObjectId();

        let transaction;
        try {
            [transaction] = await Transaction.create([{
                _id: transactionId,
                sender: sender._id,
                receiver: receiver._id,
                amount: numericAmount,
                reference,
                status: 'SUCCESS', // Correct uppercase status format
                moneyDebited: false,
                requestId
            }]);
            
            // Re-adjust status back to PROCESSING to match logic
            transaction.status = 'PROCESSING';
            await transaction.save();
        } catch (err) {
            if (err.code === 11000) {
                const error = new Error('Duplicate request detected');
                error.statusCode = 429;
                throw error;
            }
            throw err;
        }

        const session = await mongoose.startSession();
        try {
            let finalSenderBalance;
            await session.withTransaction(async () => {
                const updatedSender = await User.findOneAndUpdate(
                    { _id: sender._id, accountBalance: { $gte: numericAmount } },
                    { $inc: { accountBalance: -numericAmount } },
                    { session, new: true }
                );

                if (!updatedSender) {
                    throw new Error('Insufficient balance or concurrent conflict');
                }
                finalSenderBalance = updatedSender.accountBalance;

                const updatedReceiver = await User.findOneAndUpdate(
                    { _id: receiver._id },
                    { $inc: { accountBalance: numericAmount } },
                    { session, new: true }
                );
                
                if (!updatedReceiver) throw new Error('Receiver update failed');

                transaction.moneyDebited = true;
                transaction.status = 'SUCCESS';
                await transaction.save({ session });
            }, { maxCommitTimeMS: 10000 });

            const receiptData = {
                reference: transaction.reference,
                transactionId: transaction._id,
                amount: transaction.amount,
                senderEmail: sender.email,
                receiverEmail: receiver.email,
                createdAt: transaction.createdAt.toISOString()
            };

            await AuditLog.create({
                user: sender._id,
                action: 'TRANSFER_SUCCESS',
                ipAddress,
                device: userAgent,
                details: { transactionId, amount: numericAmount, receiver: receiverEmail, reference }
            });

            session.endSession();

            return {
                receipt: {
                    reference: transaction.reference,
                    transactionId: transaction._id,
                    amount: transaction.amount,
                    status: transaction.status,
                    sender: { name: sender.name, email: sender.email },
                    receiver: { name: receiver.name, email: receiver.email },
                    senderBalanceAfter: finalSenderBalance,
                    createdAt: transaction.createdAt,
                    receiptHash: this.generateReceiptHash(receiptData),
                    receiptVersion: '1.0.0',
                    generatedBy: 'SecureBank Core Ledger'
                }
            };
        } catch (err) {
            if (session.inTransaction()) {
                await session.abortTransaction();
            }
            session.endSession();
            
            transaction.status = 'FAILED';
            await transaction.save().catch(() => {});

            const error = new Error(err.message || 'Transfer failed');
            error.statusCode = 400;
            throw error;
        }
    }

    static async getMyTransactions(userId) {
        const transactions = await Transaction.find({
            $or: [
                { sender: userId },
                { receiver: userId }
            ]
        })
            .populate('sender', 'name email')
            .populate('receiver', 'name email')
            .sort({ createdAt: -1 });

        return transactions;
    }
}

module.exports = TransactionService;
