# Contributing to SecureBank

Thank you for your interest in contributing to SecureBank! This document provides guidelines and standards for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/secure-banking-lab.git`
3. Install dependencies: `cd client && npm install && cd ../server && npm install`
4. Create a feature branch: `git checkout -b feat/your-feature`

## Development Setup

### Option 1: Docker (Recommended)
```bash
docker compose up -d
```

### Option 2: Manual
```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix       | Use Case                          |
|-------------|-----------------------------------|
| `feat:`     | New feature                       |
| `fix:`      | Bug fix                           |
| `docs:`     | Documentation changes             |
| `refactor:` | Code refactoring (no feature/fix) |
| `test:`     | Adding or updating tests          |
| `perf:`     | Performance improvements          |
| `ci:`       | CI/CD changes                     |
| `build:`    | Build system changes              |
| `chore:`    | Maintenance tasks                 |

### Examples
```
feat: add multi-currency support to transfer engine
fix: prevent negative balance in concurrent transfers
docs: update API documentation for 2FA flow
test: add Playwright E2E tests for login flow
perf: optimize Dashboard re-renders with React.memo
ci: add Lighthouse CI to GitHub Actions pipeline
```

## Code Standards

### Frontend (React)
- Use functional components with hooks
- Wrap heavy components in `React.memo`
- Use `useCallback` for event handlers passed as props
- Use `useMemo` for expensive computations
- Follow existing CSS variable theming system

### Backend (Node.js/Express)
- Use the unified `logger` utility (never `console.log`)
- Always validate and sanitize user input
- Use MongoDB sessions for financial operations
- Follow existing error response structure
- Add audit logging for security-sensitive actions

### Security
- Never expose sensitive data in error messages
- Always use `httpOnly` cookies for tokens
- Rate limit all public-facing endpoints
- Use `bcrypt` for password/PIN hashing
- Validate JWT tokens with proper error handling

## Testing

Before submitting a PR, ensure:

```bash
# Run E2E tests
npm run test:e2e:desktop

# Run security tests
npm run test:security

# Run load test smoke
npm run test:load:smoke

# Run load test stress
npm run test:load:stress
```

## Pull Request Process

1. Update documentation if needed
2. Add tests for new features
3. Ensure all existing tests pass
4. Update CHANGELOG.md
5. Request review from maintainers

## Code of Conduct

Be respectful, inclusive, and professional. We follow the [Contributor Covenant](https://www.contributor-covenant.org/).
