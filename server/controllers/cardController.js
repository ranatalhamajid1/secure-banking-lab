const VirtualCard = require('../models/VirtualCard');
const AuditLog = require('../models/AuditLog');
const crypto = require('crypto');
const { validationResult } = require('express-validator');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex'); // For MVP
const IV_LENGTH = 16;

function encrypt(text) {
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

function generateCardNumber() {
    let num = '4' + Math.floor(Math.random() * 100000000000000).toString().padStart(14, '0');
    return num + Math.floor(Math.random() * 10).toString();
}

function generateCVV() {
    return Math.floor(100 + Math.random() * 900).toString();
}

exports.createCard = async (req, res) => {
    try {
        const user = await require('../models/User').findById(req.user.id);
        
        const existingCard = await VirtualCard.findOne({ user: user._id, cardType: 'virtual', status: 'active' });
        if (existingCard) {
            return res.status(400).json({ message: 'You already have an active virtual card.' });
        }

        const rawCardNumber = generateCardNumber();
        const rawCVV = generateCVV();
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
            ipAddress: req.ip,
            device: req.headers['user-agent'],
            details: { cardId: newCard._id }
        });

        res.status(201).json({
            message: 'Virtual card created successfully',
            card: {
                _id: newCard._id,
                cardHolderName: newCard.cardHolderName,
                maskedNumber: newCard.maskedNumber,
                expiryDate: newCard.expiryDate,
                fullCardNumber: rawCardNumber,
                cvv: rawCVV,
                status: newCard.status,
                permissions: newCard.permissions,
                spendingLimit: newCard.spendingLimit
            }
        });
    } catch (error) {
        console.error('CREATE CARD ERROR:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

exports.getUserCards = async (req, res) => {
    try {
        const cards = await VirtualCard.find({ user: req.user.id }).select('-cvv -cardNumber');
        res.json(cards);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.freezeCard = async (req, res) => {
    try {
        const { id } = req.params;
        const card = await VirtualCard.findOne({ _id: id, user: req.user.id });
        
        if (!card) {
            return res.status(404).json({ message: 'Card not found' });
        }

        card.status = card.status === 'active' ? 'frozen' : 'active';
        await card.save();

        await AuditLog.create({
            user: req.user.id,
            action: card.status === 'frozen' ? 'CARD_FROZEN' : 'CARD_UNFROZEN',
            ipAddress: req.ip,
            device: req.headers['user-agent'],
            details: { cardId: card._id }
        });

        res.json({ message: `Card is now ${card.status}`, card: { _id: card._id, status: card.status } });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updatePermissions = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { id } = req.params;
        const { permissions, spendingLimit } = req.body;

        const card = await VirtualCard.findOne({ _id: id, user: req.user.id });
        
        if (!card) {
            return res.status(404).json({ message: 'Card not found' });
        }

        if (card.status === 'frozen') {
            return res.status(400).json({ message: 'Cannot update permissions on a frozen card' });
        }

        if (permissions) {
            card.permissions = { ...card.permissions, ...permissions };
        }
        
        if (spendingLimit) {
            card.spendingLimit = { ...card.spendingLimit, ...spendingLimit };
        }

        await card.save();

        await AuditLog.create({
            user: req.user.id,
            action: 'CARD_PERMISSIONS_UPDATED',
            ipAddress: req.ip,
            device: req.headers['user-agent'],
            details: { cardId: card._id }
        });

        res.json({ message: 'Card updated successfully', permissions: card.permissions, spendingLimit: card.spendingLimit });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.revealCVV = async (req, res) => {
    try {
        const { id } = req.params;
        const { pin } = req.body;

        if (!pin) {
            return res.status(400).json({ message: 'PIN is required to reveal CVV' });
        }

        const User = require('../models/User');
        const user = await User.findById(req.user.id);

        if (!user.transferPinHash) {
            return res.status(400).json({ message: 'Please set up a Transfer PIN in Security Settings first' });
        }

        const bcrypt = require('bcrypt');
        const isPinValid = await bcrypt.compare(pin, user.transferPinHash);
        if (!isPinValid) {
            return res.status(401).json({ message: 'Invalid Transfer PIN' });
        }

        const card = await VirtualCard.findOne({ _id: id, user: req.user.id });
        if (!card) {
            return res.status(404).json({ message: 'Card not found' });
        }

        let rawCVV, rawCardNumber;
        try {
            rawCVV = decrypt(card.cvv);
            rawCardNumber = decrypt(card.cardNumber);
        } catch (decryptError) {
            console.error('Card decryption failed (key mismatch):', decryptError.message);
            // Delete the corrupted card so user can create a new one
            await VirtualCard.deleteOne({ _id: card._id });
            await AuditLog.create({
                user: req.user.id,
                action: 'CARD_DELETED_CORRUPT',
                ipAddress: req.ip,
                device: req.headers['user-agent'],
                details: { cardId: card._id, reason: 'Encryption key mismatch' }
            });
            return res.status(400).json({ 
                message: 'Card data is corrupted due to a server key change. The card has been removed. Please generate a new card.',
                cardDeleted: true
            });
        }

        await AuditLog.create({
            user: req.user.id,
            action: 'CVV_REVEALED',
            ipAddress: req.ip,
            device: req.headers['user-agent'],
            details: { cardId: card._id }
        });

        res.json({ cvv: rawCVV, cardNumber: rawCardNumber });
    } catch (error) {
        console.error('Reveal CVV Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
