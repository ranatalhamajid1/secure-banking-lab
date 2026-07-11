const Device = require('../models/Device');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const bcrypt = require('bcrypt');

exports.getDevices = async (req, res) => {
    try {
        const devices = await Device.find({ user: req.user.id }).sort('-lastLogin');
        res.status(200).json(devices);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.removeDevice = async (req, res) => {
    try {
        const device = await Device.findOne({ _id: req.params.id, user: req.user.id });
        if (!device) return res.status(404).json({ message: 'Device not found' });
        
        await device.deleteOne();
        res.status(200).json({ message: 'Device removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.setTransferPin = async (req, res) => {
    try {
        const { pin } = req.body;
        if (!pin || pin.length !== 4) {
            return res.status(400).json({ message: 'PIN must be exactly 4 digits' });
        }

        const user = await User.findById(req.user.id);
        const salt = await bcrypt.genSalt(10);
        user.transferPinHash = await bcrypt.hash(pin, salt);
        await user.save();

        await AuditLog.create({
            user: user._id,
            action: 'PIN_SET',
            ipAddress: req.ip,
            device: req.headers['user-agent'] || 'Unknown'
        });

        res.status(200).json({ message: 'Transfer PIN set successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
