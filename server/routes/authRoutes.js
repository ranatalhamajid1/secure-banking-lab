const express = require('express');
const router = express.Router();
const { register, login, logout, refresh, setup2FA, verify2FA } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { loginLimiter } = require('../middleware/rateLimiter');
const User = require('../models/User');

router.post('/register', register);
router.post('/login', loginLimiter, login);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.post('/2fa/verify', verify2FA);
router.post('/2fa/setup', protect, setup2FA);

router.get('/me', protect, async (req, res) => {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({ 
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            accountBalance: user.accountBalance,
            role: user.role,
            hasTransferPin: !!user.transferPinHash,
            twoFactorEnabled: user.twoFactorEnabled
        }
    });
});

module.exports = router;