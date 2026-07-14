# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] - 2026-07-12

### Added
- Admin dashboard with user management, transaction monitoring, and audit logs
- Admin-only route protection middleware
- Audit log model and comprehensive event tracking

### Security
- Applied `loginLimiter` rate limiting to `/2fa/verify` endpoint
- Replaced raw `userId` with signed `tempToken` JWT in 2FA flow
- Fixed NoSQL injection vulnerability in sanitization middleware
- Sanitized receipt HTML template to prevent DOM XSS

### Changed
- JWT cookies now use `secure: true` when `NODE_ENV === 'production'`
- Replaced in-memory `Set` transfer lock with MongoDB atomic operations
- Replaced in-memory `Map` idempotency cache with database-level `requestId` unique index
- Transfer balance deduction uses `findOneAndUpdate` with `$gte` guard for ACID safety
- Dashboard component wrapped in `React.memo` for performance

### Infrastructure
- Added Playwright E2E testing with 4 responsive viewports
- Added axe-core accessibility scanning
- Added Artillery load testing configuration
- Added Lighthouse CI performance budgets
- Added Docker and Docker Compose for one-command setup
- Added GitHub Actions CI/CD pipeline
- Added observability middleware (request IDs, response time logging)
- Enhanced `/health` endpoint with system metrics

### Documentation
- Added `/docs` directory with architecture, API, database, security, deployment, testing, and ADR documentation
- Added comprehensive README.md
- Added CHANGELOG.md, CONTRIBUTING.md, and LICENSE

## [1.3.0] - 2026-07-01

### Added
- Two-Factor Authentication (TOTP) with Google Authenticator
- QR code generation for 2FA setup
- 2FA verification during login flow

## [1.2.0] - 2026-06-15

### Added
- Transfer PIN system with bcrypt hashing
- PIN verification required for all transfers
- Security settings page for PIN management

## [1.1.0] - 2026-06-01

### Added
- Virtual card generation (Visa/Mastercard)
- Encrypted card storage (AES-256)
- Card management UI with 3D card preview
- Spending limits

## [1.0.0] - 2026-05-15

### Added
- Initial release
- User registration and authentication
- JWT + httpOnly cookie authentication
- Money transfer system with receipts
- Transaction history with search and filters
- Dashboard with charts and analytics
- Dark/Light theme support
- Responsive design
- Inactivity timer
