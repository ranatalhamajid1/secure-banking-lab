const mongoose = require('mongoose');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const AuditLog = require('../models/AuditLog');
const bcrypt = require('bcrypt');
const crypto = require('crypto');


// TRANSFER MONEY
exports.transferMoney = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const { receiverEmail, amount, pin } = req.body;

        if (!receiverEmail || !amount || !pin) {
            session.endSession();
            return res.status(400).json({ message: 'Receiver, amount, and PIN are required' });
        }

        const [sender, receiver] = await Promise.all([
            User.findById(req.user.id),
            User.findOne({ email: receiverEmail })
        ]);
        
        if (!sender.transferPinHash) {
            session.endSession();
            return res.status(400).json({ message: 'Please set up a Transfer PIN in Security Settings first' });
        }

        const isPinValid = await bcrypt.compare(pin, sender.transferPinHash);
        if (!isPinValid) {
            session.endSession();
            return res.status(400).json({ message: 'Invalid Transfer PIN' }); 
        }

        if (!receiver) {
            session.endSession();
            return res.status(404).json({ message: 'Receiver not found' });
        }

        if (sender.email === receiver.email) {
            session.endSession();
            return res.status(400).json({ message: 'Cannot transfer to yourself' });
        }

        if (sender.accountBalance < amount) {
            session.endSession();
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        const year = new Date().getFullYear();
        const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase();
        const reference = `SB-${year}-${randomStr}`;

        const transactionId = new mongoose.Types.ObjectId();

        const [transaction] = await Transaction.create([{
            _id: transactionId,
            sender: sender._id,
            receiver: receiver._id,
            amount,
            reference,
            status: "PROCESSING",
            moneyDebited: false
        }]);

        await AuditLog.create({
            user: sender._id,
            action: 'TRANSFER_STARTED',
            ipAddress: req.ip,
            device: req.headers['user-agent'] || 'Unknown',
            details: { transactionId: transactionId, amount, receiver: receiverEmail, reference }
        });

        try {
            await session.withTransaction(async () => {
                sender.accountBalance -= amount;
                receiver.accountBalance += amount;

                await sender.save({ session });
                await receiver.save({ session });

                transaction.moneyDebited = true;
                transaction.status = "SUCCESS";
                await transaction.save({ session });
            });

            await AuditLog.create({
                user: sender._id,
                action: 'TRANSFER_SUCCESS',
                ipAddress: req.ip,
                device: req.headers['user-agent'] || 'Unknown',
                details: { transactionId: transactionId, amount, receiver: receiverEmail, reference }
            });

            session.endSession();

            return res.status(200).json({
                message: 'Transfer successful',
                receipt: {
                    reference: transaction.reference,
                    amount: transaction.amount,
                    status: transaction.status,
                    sender: {
                        name: sender.name,
                        email: sender.email
                    },
                    receiver: {
                        name: receiver.name,
                        email: receiver.email
                    },
                    createdAt: transaction.createdAt
                }
            });

        } catch (dbError) {
            transaction.status = "FAILED";
            await transaction.save();

            await AuditLog.create({
                user: sender._id,
                action: 'TRANSFER_FAILED',
                ipAddress: req.ip,
                device: req.headers['user-agent'] || 'Unknown',
                details: { transactionId: transactionId, amount, receiver: receiverEmail, reference, error: dbError.message }
            });

            throw dbError; // Pass to outer catch
        }

    } catch (err) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        session.endSession();
        console.error(err);
        res.status(500).json({
            message: 'Server error',
            error: err.message
        });
    }
};



// GET MY TRANSACTIONS
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

            transactions

        });


    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: 'Server error'
        });

    }

};