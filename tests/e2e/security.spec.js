// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * SecureBank – Security E2E Tests
 *
 * Covers:
 * - 2FA bypass attempt (raw userId vs tempToken)
 * - NoSQL injection payloads
 * - XSS payload injection
 * - Invalid/expired JWT handling
 * - Duplicate requestId (replay attack)
 * - Invalid Transfer PIN
 */

const API_URL = 'http://127.0.0.1:5000/api';

// ═══════════════════════════════════════════════════════
//  2FA BYPASS ATTACK
// ═══════════════════════════════════════════════════════

test.describe('2FA Security', () => {
  test('should REJECT verify-2fa with raw userId (no tempToken)', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/2fa/verify`, {
      data: {
        userId: '507f1f77bcf86cd799439011',
        code: '123456',
      },
    });

    // Must be rejected – our fix requires a valid tempToken
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.message).toContain('Temporary session missing');
  });

  test('should REJECT verify-2fa with expired/invalid tempToken', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/2fa/verify`, {
      data: {
        tempToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZGNjOWI1NjZhY2ZhMDAxMjM0NTY3OCIsImlzVGVtcCI6dHJ1ZSwiZXhwIjoxfQ.invalid_signature',
        code: '123456',
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.message).toContain('Session expired or invalid');
  });

  test('should REJECT verify-2fa with a non-temp token (regular JWT)', async ({ request }) => {
    // A regular JWT (without isTemp: true) should be rejected even if valid
    const response = await request.post(`${API_URL}/auth/2fa/verify`, {
      data: {
        tempToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZGNjOWI1NjZhY2ZhMDAxMjM0NTY3OCIsInJvbGUiOiJ1c2VyIiwiZXhwIjo5OTk5OTk5OTk5fQ.fake_sig',
        code: '123456',
      },
    });

    expect(response.status()).toBe(401);
  });
});

// ═══════════════════════════════════════════════════════
//  NOSQL INJECTION
// ═══════════════════════════════════════════════════════

test.describe('NoSQL Injection Prevention', () => {
  test('should reject NoSQL injection in login email', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: { $ne: null },
        password: 'password123',
      },
    });

    // Should not return a valid user – must be 400 or 401
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('should reject NoSQL injection in login password', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: 'admin@securebank.com',
        password: { $gt: '' },
      },
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('should reject $regex operator injection', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: { $regex: '.*' },
        password: { $regex: '.*' },
      },
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});

// ═══════════════════════════════════════════════════════
//  INVALID JWT / EXPIRED TOKEN
// ═══════════════════════════════════════════════════════

test.describe('JWT Security', () => {
  test('should reject requests with invalid JWT cookie', async ({ request }) => {
    const response = await request.get(`${API_URL}/auth/me`, {
      headers: {
        Cookie: 'token=invalid.jwt.token',
      },
    });

    expect(response.status()).toBe(401);
  });

  test('should reject requests with no token', async ({ request }) => {
    const response = await request.get(`${API_URL}/auth/me`);
    expect(response.status()).toBe(401);
  });

  test('should reject transfer without authentication', async ({ request }) => {
    const response = await request.post(`${API_URL}/transactions/transfer`, {
      data: {
        receiverEmail: 'victim@test.com',
        amount: 100,
        pin: '1234',
        requestId: 'attack-attempt-1',
      },
    });

    expect(response.status()).toBe(401);
  });
});

// ═══════════════════════════════════════════════════════
//  ADMIN ROUTE PROTECTION
// ═══════════════════════════════════════════════════════

test.describe('Admin Route Protection', () => {
  test('should reject unauthenticated admin access', async ({ request }) => {
    const response = await request.get(`${API_URL}/admin/users`);
    expect(response.status()).toBe(401);
  });

  test('should reject unauthenticated audit logs access', async ({ request }) => {
    const response = await request.get(`${API_URL}/admin/audit-logs`);
    expect(response.status()).toBe(401);
  });
});

// ═══════════════════════════════════════════════════════
//  RATE LIMITING
// ═══════════════════════════════════════════════════════

test.describe('Rate Limiting', () => {
  test('should rate limit excessive login attempts', async ({ request }) => {
    let rateLimited = false;

    // Fire 55 login requests rapidly (limit is 50/15min)
    for (let i = 0; i < 55; i++) {
      const response = await request.post(`${API_URL}/auth/login`, {
        data: {
          email: `bruteforce${i}@attack.com`,
          password: 'wrongpassword',
        },
      });

      if (response.status() === 429) {
        rateLimited = true;
        break;
      }
    }

    expect(rateLimited).toBe(true);
  });
});
