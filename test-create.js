require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const VirtualCard = require('./server/models/VirtualCard');
const User = require('./server/models/User');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const IV_LENGTH = 16;

function encrypt(text) {
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function generateCardNumber() {
    let num = '4' + Math.floor(Math.random() * 100000000000000).toString().padStart(14, '0');
    return num + Math.floor(Math.random() * 10).toString();
}

function generateCVV() {
    return Math.floor(100 + Math.random() * 900).toString();
}

async function run() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/secure-bank');
    console.log("Connected to MongoDB");

    try {
        const user = await User.findOne();
        console.log("Found user:", user.id);

        const rawCardNumber = generateCardNumber();
        const rawCVV = generateCVV();
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 3);
        const expString = `${(expiryDate.getMonth() + 1).toString().padStart(2, '0')}/${expiryDate.getFullYear().toString().slice(2)}`;

        const maskedNumber = '**** **** **** ' + rawCardNumber.slice(-4);
        const encryptedNumber = encrypt(rawCardNumber);

        console.log("Creating card...");
        const newCard = new VirtualCard({
            user: user._id,
            cardHolderName: user.name,
            cardNumber: encryptedNumber,
            maskedNumber,
            expiryDate: expString,
            cvv: rawCVV,
            cardType: 'virtual'
        });

        await newCard.save();
        console.log("Card saved successfully!");
    } catch (e) {
        console.error("Error creating card:", e);
    }
    
    process.exit(0);
}

run();
