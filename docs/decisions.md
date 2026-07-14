# SecureBank – Architecture Decision Records (ADRs)

## ADR-001: Context API over Redux

**Date:** 2026-07-01  
**Status:** Accepted  
**Context:** State management solution for the React frontend.

**Decision:** Use React Context API with `useContext` + `useCallback` + `useRef`.

**Rationale:**
- The application has a limited number of global states (user, transactions, cards, admin data)
- Context API is built into React – zero bundle size overhead
- Combined with `useRef` for concurrent-call protection, it handles our use case efficiently
- Redux would add ~15KB to the bundle and introduce unnecessary boilerplate for our state complexity

**Consequences:**
- ✅ Simpler codebase, fewer dependencies
- ✅ Direct React integration, no middleware configuration
- ⚠️ Deep component trees may cause unnecessary re-renders (mitigated with `React.memo`)

---

## ADR-002: MongoDB Sessions over Redis Locks

**Date:** 2026-07-12  
**Status:** Accepted  
**Context:** Concurrency control for money transfers to prevent double-spending.

**Decision:** Use MongoDB ACID transactions with `findOneAndUpdate` + `$gte` guard inside `session.withTransaction()`.

**Rationale:**
- MongoDB 4.0+ supports multi-document ACID transactions
- `findOneAndUpdate` with `$gte` provides an atomic balance check + deduction in one operation
- Eliminates the need for external Redis infrastructure
- The `requestId` unique index on the Transaction collection provides database-level idempotency

**Alternatives Considered:**
- **Redis distributed locks**: Requires additional infrastructure; overkill for single-region deployment
- **In-memory Set locks**: Not safe across multiple server instances; removed in enterprise refactor
- **Optimistic concurrency (`__v`)**: Requires retry loops; less deterministic

**Consequences:**
- ✅ Zero additional infrastructure (no Redis)
- ✅ ACID guarantees from MongoDB
- ⚠️ Requires MongoDB replica set (Atlas provides this by default)

---

## ADR-003: tempToken JWT for 2FA

**Date:** 2026-07-12  
**Status:** Accepted  
**Context:** The original 2FA flow returned a raw `userId` to the client, which could be brute-forced.

**Decision:** Issue a short-lived (5 minute) JWT with `isTemp: true` after password verification.

**Rationale:**
- The `userId` is a MongoDB ObjectId – predictable and enumerable
- A signed JWT with 5-minute expiry is cryptographically secure
- The `isTemp` flag ensures regular access tokens cannot be used for 2FA verification
- Combined with `loginLimiter` rate limiting on the verify endpoint

**Consequences:**
- ✅ 2FA flow is now cryptographically secured
- ✅ 5-minute window prevents brute-force attacks
- ✅ Token type validation prevents token misuse

---

## ADR-004: Playwright over Cypress for E2E

**Date:** 2026-07-12  
**Status:** Accepted  
**Context:** Choosing an E2E testing framework for comprehensive test coverage.

**Decision:** Use Playwright with axe-core for combined E2E, visual regression, accessibility, and API testing.

**Rationale:**
- Playwright supports multi-browser testing and multiple viewports natively
- Built-in API testing (`request` fixture) for security tests without browser overhead
- `toHaveScreenshot()` for visual regression out of the box
- Faster execution than Cypress due to browser automation protocol
- Native support for network interception (`page.route`) for resilience testing

**Consequences:**
- ✅ Single tool covers E2E, visual, accessibility, API, and resilience testing
- ✅ Excellent CI/CD integration with GitHub Actions
- ⚠️ Steeper learning curve compared to Cypress

---

## ADR-005: Artillery for Load Testing

**Date:** 2026-07-12  
**Status:** Accepted  
**Context:** Validating backend performance and concurrency locks under load.

**Decision:** Use Artillery with YAML-based test scenarios.

**Rationale:**
- Lightweight, configuration-driven load testing
- Supports phased load profiles (warm-up, ramp-up, sustained)
- Easy to integrate in CI/CD pipelines as a smoke test
- Separates concerns: Playwright for UI, Artillery for backend load

**Consequences:**
- ✅ Clear separation of E2E and load testing
- ✅ YAML configs are human-readable and version-controlled
