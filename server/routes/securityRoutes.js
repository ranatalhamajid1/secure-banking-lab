const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getDevices, removeDevice, setTransferPin } = require('../controllers/securityController');
const { sensitiveLimiter } = require('../middleware/rateLimiter');

router.get('/devices', protect, getDevices);
router.delete('/devices/:id', protect, removeDevice);
router.post('/set-pin', sensitiveLimiter, protect, setTransferPin);

module.exports = router;
