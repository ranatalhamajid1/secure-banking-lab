require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const { apiLimiter } = require('./middleware/rateLimiter');
const { refundStuckTransactions } = require('./services/refundService');

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Security Middleware
app.use(helmet());

// Custom mongo-sanitize for Express 5 compatibility (req.query is read-only)
app.use((req, res, next) => {
    if (req.body) mongoSanitize.sanitize(req.body);
    if (req.params) mongoSanitize.sanitize(req.params);
    next();
});

app.use(hpp());

// Apply global rate limiting to all /api/ routes
app.use('/api/', apiLimiter);

app.use(
    '/uploads',
    express.static('uploads')
);

app.use('/api/auth', require('./routes/authRoutes'));
app.use(
    '/api/transactions',
    require('./routes/transactionRoutes')
);

app.use(
    '/api/security',
    require('./routes/securityRoutes')
);

app.use(
    '/api/admin',
    require('./routes/adminRoutes')
);

app.use(
    '/api/upload',
    require('./routes/uploadRoutes')
);

app.use(
    '/api/cards',
    require('./routes/cardRoutes')
);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is running' });
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected');
        refundStuckTransactions();
        setInterval(refundStuckTransactions, 60 * 60 * 1000);
    })
    .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});