const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

const refundStuckTransactions = async () => {
    try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        // Find transactions stuck in PROCESSING where money was actually debited
        const stuckTransactions = await Transaction.find({
            status: 'PROCESSING',
            moneyDebited: true,
            createdAt: { $lt: twentyFourHoursAgo }
        });

        if (stuckTransactions.length === 0) {
            return;
        }

        console.log(`[RefundService] Found ${stuckTransactions.length} stuck transactions. Processing refunds...`);

        for (const tx of stuckTransactions) {
            const session = await mongoose.startSession();
            try {
                await session.withTransaction(async () => {
                    const sender = await User.findById(tx.sender).session(session);
                    if (sender) {
                        sender.accountBalance += tx.amount;
                        await sender.save({ session });
                    }
                    
                    tx.status = 'REFUNDED';
                    await tx.save({ session });
                });
                
                await AuditLog.create({
                    user: tx.sender,
                    action: 'TRANSFER_REFUNDED',
                    details: { transactionId: tx._id, amount: tx.amount, reference: tx.reference, reason: 'Stuck in processing > 24h' }
                });

                console.log(`[RefundService] Successfully refunded transaction ${tx.reference}`);
            } catch (error) {
                console.error(`[RefundService] Failed to refund transaction ${tx.reference}:`, error);
            } finally {
                session.endSession();
            }
        }
    } catch (error) {
        console.error('[RefundService] Error running refund check:', error);
    }
};

module.exports = { refundStuckTransactions };
