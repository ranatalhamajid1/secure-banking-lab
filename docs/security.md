# SecureBank – Security Documentation

## Threat Model

| Threat                  | Severity | Mitigation                                                    | Status |
|------------------------|----------|---------------------------------------------------------------|--------|
| NoSQL Injection        | Critical | `express-mongo-sanitize` on all req properties                | ✅ Fixed |
| 2FA Bypass             | Critical | Replaced raw `userId` with signed `tempToken` JWT (5min TTL)  | ✅ Fixed |
| 2FA Brute Force        | High     | `loginLimiter` (50 req/15min) applied to `/2fa/verify`        | ✅ Fixed |
| Double-Spend (Race)    | Critical | MongoDB `findOneAndUpdate` with `$gte` inside ACID session    | ✅ Fixed |
| Replay Attack          | High     | `requestId` stored in DB with unique sparse index             | ✅ Fixed |
| DOM XSS (Receipt)      | High     | `escapeHTML()` sanitizer in `handlePrint` template literals   | ✅ Fixed |
| Cookie Sniffing        | Medium   | `secure: process.env.NODE_ENV === 'production'` on all cookies| ✅ Fixed |
| Memory DoS (Cache)     | Medium   | Removed in-memory `Map` idempotency cache; uses MongoDB       | ✅ Fixed |
| Memory DoS (Lock)      | Medium   | Removed in-memory `Set` transfer lock; uses DB atomics        | ✅ Fixed |
| HTTP Parameter Pollution| Low     | `hpp` middleware enabled                                      | ✅ Active |
| Missing Security Headers| Low     | `helmet` middleware enabled                                   | ✅ Active |

## Authentication Architecture

### Token Strategy
- **Access Token**: JWT, 15-minute expiry, stored in `httpOnly` cookie
- **Refresh Token**: JWT, 7-day expiry, stored in `httpOnly` cookie, validated against DB
- **Temp Token (2FA)**: JWT, 5-minute expiry, `isTemp: true` flag, returned in response body

### Cookie Configuration
```javascript
{
    httpOnly: true,                                    // Not accessible via JavaScript
    secure: process.env.NODE_ENV === 'production',     // HTTPS only in production
    sameSite: 'strict'                                 // CSRF protection
}
```

### Rate Limiting
| Endpoint             | Limit         | Window  |
|---------------------|---------------|---------|
| `/api/auth/login`   | 50 requests   | 15 min  |
| `/api/auth/2fa/verify` | 50 requests | 15 min  |
| `/api/security/set-pin` | 20 requests | 15 min |
| All `/api/*`        | 100 requests  | 1 min   |

## Transfer Security

### Concurrency Control
The transfer engine uses MongoDB's atomic `findOneAndUpdate` with an optimistic concurrency guard:

```javascript
const updatedSender = await User.findOneAndUpdate(
    { _id: sender._id, accountBalance: { $gte: numericAmount } },
    { $inc: { accountBalance: -numericAmount } },
    { session, new: true }
);
```

This guarantees:
1. **No negative balances** – the `$gte` check is atomic with the deduction
2. **No race conditions** – MongoDB document-level locking inside a session
3. **No double-spends** – `requestId` unique index prevents duplicate transactions

### Idempotency
- Frontend generates a `requestId` via `useRef` on initial transfer intent
- The same `requestId` persists across retries (button re-clicks)
- Backend stores `requestId` in Transaction schema with a `unique: true, sparse: true` index
- Duplicate `requestId` → MongoDB duplicate key error → caught and returned as 429
