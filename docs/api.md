# SecureBank – API Documentation

## Base URL
```
Development:  http://localhost:5000/api
Production:   https://api.securebank.com/api
```

## Authentication
All protected endpoints require JWT authentication via `httpOnly` cookies.
Cookies are automatically sent with `withCredentials: true`.

---

## Auth Endpoints

### POST `/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": { "id": "...", "name": "John Doe", "email": "john@example.com", "role": "user" }
}
```

---

### POST `/auth/login`
Authenticate and receive JWT cookies.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200) – Without 2FA:**
```json
{
  "message": "Login successful",
  "user": { "id": "...", "name": "John Doe", "email": "john@example.com", "role": "user" }
}
```

**Response (200) – With 2FA:**
```json
{
  "message": "2FA required",
  "requires2FA": true,
  "tempToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### POST `/auth/2fa/verify`
Complete 2FA authentication.

**Request Body:**
```json
{
  "tempToken": "eyJhbGciOiJIUzI1NiIs...",
  "code": "123456"
}
```

---

### POST `/auth/logout`
Clear authentication cookies.

### POST `/auth/refresh`
Refresh the access token using the refresh token cookie.

### GET `/auth/me` 🔒
Get current authenticated user profile.

---

## Transaction Endpoints

### POST `/transactions/transfer` 🔒
Transfer money to another user.

**Request Body:**
```json
{
  "receiverEmail": "jane@example.com",
  "amount": 500,
  "pin": "1234",
  "requestId": "unique-uuid-v4"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Transfer successful",
  "data": {
    "receipt": {
      "reference": "SB-2026-A1B2C3",
      "transactionId": "...",
      "amount": 500,
      "status": "SUCCESS",
      "sender": { "name": "John", "email": "john@example.com" },
      "receiver": { "name": "Jane", "email": "jane@example.com" },
      "senderBalanceAfter": 500,
      "createdAt": "2026-07-12T12:00:00Z",
      "receiptHash": "sha256...",
      "receiptVersion": "1.0.0",
      "generatedBy": "SecureBank Core Ledger"
    }
  }
}
```

### GET `/transactions/history` 🔒
Get authenticated user's transaction history.

---

## Security Endpoints

### POST `/security/set-pin` 🔒 (Rate Limited)
Set or update the transfer PIN.

### GET `/security/devices` 🔒
List all logged-in devices.

### DELETE `/security/devices/:id` 🔒
Remove a device session.

---

## Admin Endpoints (Admin Only)

### GET `/admin/users` 🔒👑
### GET `/admin/transactions` 🔒👑
### GET `/admin/cards` 🔒👑
### GET `/admin/audit-logs` 🔒👑

---

## Public Endpoints

### GET `/health`
System health check with metrics.

### GET `/api/public/stats`
Public platform statistics (user count, transaction volume).

---

🔒 = Requires authentication  
👑 = Requires admin role
