require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const helmet = require('helmet');
const hpp = require('hpp');
const { apiLimiter } = require('./middleware/rateLimiter');
const { requestIdMiddleware, responseTimeMiddleware } = require('./middleware/observability');
const { errorHandler } = require('./middleware/errorMiddleware');


const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(compression());

// Security Middleware
app.use(helmet());

// Observability Middleware
app.use(requestIdMiddleware);
app.use(responseTimeMiddleware);

app.use(hpp());

// Apply global rate limiting to all /api/ routes
app.use('/api/', apiLimiter);

app.use(
    '/uploads',
    express.static('uploads', { maxAge: '1d' })
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
    const memUsage = process.memoryUsage();
    res.status(200).json({
        status: 'ok',
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        environment: process.env.NODE_ENV || 'development',
        memory: {
            heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
            rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
        },
        version: '1.0.0',
    });
});

let statsCache = { data: null, lastFetched: 0 };
app.get('/api/public/stats', async (req, res) => {
    try {
        const now = Date.now();
        if (statsCache.data && now - statsCache.lastFetched < 60000) {
            statsCache.data.data.uptime = Math.floor(process.uptime());
            return res.status(200).json(statsCache.data);
        }

        const User = require('./models/User');
        const Transaction = require('./models/Transaction');
        const VirtualCard = require('./models/VirtualCard');

        const userCount = await User.countDocuments() || 0;
        const transactionCount = await Transaction.countDocuments() || 0;
        const cardCount = await VirtualCard.countDocuments() || 0;

        const txAggregate = await Transaction.aggregate([
            { $match: { status: 'SUCCESS' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const moneyProcessed = txAggregate.length > 0 ? txAggregate[0].total : 0;

        const responseData = {
            success: true,
            data: {
                users: userCount,
                transactions: transactionCount,
                moneyProcessed: moneyProcessed,
                cards: cardCount,
                securityScore: 99.9,
                uptime: Math.floor(process.uptime())
            }
        };

        statsCache.data = responseData;
        statsCache.lastFetched = now;

        res.status(200).json(responseData);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

const logger = require('./utils/logger');

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        logger.info('MongoDB connected');
    })
    .catch((err) => logger.error('MongoDB connection error:', err));

// Serve frontend static files in production
const path = require('path');
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));

    app.get(/.*/, (req, res) => {
        res.sendFile(path.resolve(__dirname, '../client/dist', 'index.html'));
    });
}

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    logger.info(`Server running on port ${PORT}`);
});