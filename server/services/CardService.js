const VirtualCard = require('../models/VirtualCard');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const bcrypt = require('bcrypt');
const { encrypt, decrypt } = require('../utils/encryption');

class CardService {
    static generateCardNumber() {
        let num = '4' + Math.floor(Math.random() * 100000000000000).toString().padStart(14, '0');
        return num + Math.floor(Math.random() * 10).toString();
    }

    static generateCVV() {
        return Math.floor(100 + Math.random() * 900).toString();
    }

    static async createCard(userId, ipAddress, userAgent) {
        const user = await User.findById(userId);
        
        const existingCard = await VirtualCard.findOne({ user: user._id, cardType: 'virtual', status: 'active' });
        if (existingCard) {
            const error = new Error('You already have an active virtual card.');
            error.statusCode = 400;
            throw error;
        }

        const rawCardNumber = this.generateCardNumber();
        const rawCVV = this.generateCVV();
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 3);
        const expString = `${(expiryDate.getMonth() + 1).toString().padStart(2, '0')}/${expiryDate.getFullYear().toString().slice(2)}`;

        const maskedNumber = '**** **** **** ' + rawCardNumber.slice(-4);
        const encryptedNumber = encrypt(rawCardNumber);
        const encryptedCVV = encrypt(rawCVV);

        const newCard = new VirtualCard({
            user: user._id,
            cardHolderName: user.name,
            cardNumber: encryptedNumber,
            maskedNumber,
            expiryDate: expString,
            cvv: encryptedCVV,
            cardType: 'virtual'
        });

        await newCard.save();

        await AuditLog.create({
            user: user._id,
            action: 'VIRTUAL_CARD_CREATED',
            ipAddress,
            device: userAgent,
            details: { cardId: newCard._id }
        });

        return {
            _id: newCard._id,
            cardHolderName: newCard.cardHolderName,
            maskedNumber: newCard.maskedNumber,
            expiryDate: newCard.expiryDate,
            fullCardNumber: rawCardNumber,
            cvv: rawCVV,
            status: newCard.status,
            permissions: newCard.permissions,
            spendingLimit: newCard.spendingLimit
        };
    }

    static async getUserCards(userId) {
        return await VirtualCard.find({ user: userId }).select('-cvv -cardNumber');
    }

    static async freezeCard(userId, cardId, ipAddress, userAgent) {
        const card = await VirtualCard.findOne({ _id: cardId, user: userId });
        
        if (!card) {
            const error = new Error('Card not found');
            error.statusCode = 404;
            throw error;
        }

        card.status = card.status === 'active' ? 'frozen' : 'active';
        await card.save();

        await AuditLog.create({
            user: userId,
            action: card.status === 'frozen' ? 'CARD_FROZEN' : 'CARD_UNFROZEN',
            ipAddress,
            device: userAgent,
            details: { cardId: card._id }
        });

        return card;
    }

    static async updatePermissions(userId, cardId, permissions, spendingLimit, ipAddress, userAgent) {
        const card = await VirtualCard.findOne({ _id: cardId, user: userId });
        
        if (!card) {
            const error = new Error('Card not found');
            error.statusCode = 404;
            throw error;
        }

        if (card.status === 'frozen') {
            const error = new Error('Cannot update permissions on a frozen card');
            error.statusCode = 400;
            throw error;
        }

        if (permissions) {
            card.permissions = { ...card.permissions, ...permissions };
        }
        
        if (spendingLimit) {
            card.spendingLimit = { ...card.spendingLimit, ...spendingLimit };
        }

        await card.save();

        await AuditLog.create({
            user: userId,
            action: 'CARD_PERMISSIONS_UPDATED',
            ipAddress,
            device: userAgent,
            details: { cardId: card._id }
        });

        return card;
    }

    static async revealCVV(userId, cardId, pin, ipAddress, userAgent) {
        if (!pin) {
            const error = new Error('PIN is required to reveal CVV');
            error.statusCode = 400;
            throw error;
        }

        const user = await User.findById(userId);

        if (!user.transferPinHash) {
            const error = new Error('Please set up a Transfer PIN in Security Settings first');
            error.statusCode = 400;
            throw error;
        }

        const isPinValid = await bcrypt.compare(pin, user.transferPinHash);
        if (!isPinValid) {
            const error = new Error('Invalid Transfer PIN');
            error.statusCode = 401;
            throw error;
        }

        const card = await VirtualCard.findOne({ _id: cardId, user: userId });
        if (!card) {
            const error = new Error('Card not found');
            error.statusCode = 404;
            throw error;
        }

        let rawCVV, rawCardNumber;
        try {
            rawCVV = decrypt(card.cvv);
            rawCardNumber = decrypt(card.cardNumber);
        } catch (decryptError) {
            await VirtualCard.deleteOne({ _id: card._id });
            await AuditLog.create({
                user: userId,
                action: 'CARD_DELETED_CORRUPT',
                ipAddress,
                device: userAgent,
                details: { cardId: card._id, reason: 'Encryption key mismatch' }
            });
            const error = new Error('Card data is corrupted due to a server key change. The card has been removed. Please generate a new card.');
            error.statusCode = 400;
            error.cardDeleted = true;
            throw error;
        }

        await AuditLog.create({
            user: userId,
            action: 'CVV_REVEALED',
            ipAddress,
            device: userAgent,
            details: { cardId: card._id }
        });

        return { cvv: rawCVV, cardNumber: rawCardNumber };
    }
}

module.exports = CardService;
