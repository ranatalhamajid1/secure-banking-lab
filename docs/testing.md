# SecureBank – Testing Strategy

## Quality Dimensions

| Dimension        | Tool            | Scope                                    |
|-----------------|-----------------|------------------------------------------|
| E2E Testing     | Playwright      | UI flows, visual regression, responsive  |
| Accessibility   | axe-core        | WCAG 2.1 AA compliance                  |
| Performance     | Lighthouse CI   | Core Web Vitals, SEO, Best Practices    |
| Load Testing    | Artillery       | Concurrent users, stress testing        |
| Security        | Playwright API  | Injection, JWT, 2FA bypass, replay      |

## Test Coverage Matrix

| Feature           | E2E | Visual | A11y | Security | Load | Status |
|-------------------|-----|--------|------|----------|------|--------|
| Landing Page      | ✅  | ✅     | ✅   | —        | —    | ✅     |
| Login             | ✅  | ✅     | ✅   | ✅       | ✅   | ✅     |
| Register          | ✅  | ✅     | ✅   | —        | —    | ✅     |
| 2FA               | ✅  | —      | —    | ✅       | —    | ✅     |
| Logout            | ✅  | —      | —    | —        | —    | ✅     |
| Dashboard         | ✅  | ✅     | —    | —        | ✅   | ✅     |
| Transfer          | ✅  | —      | —    | ✅       | ✅   | ✅     |
| Receipt           | ✅  | —      | —    | ✅ (XSS) | —    | ✅     |
| Cards             | ✅  | ✅     | —    | —        | —    | ✅     |
| Admin             | ✅  | —      | —    | ✅       | —    | ✅     |
| Security Center   | ✅  | ✅     | —    | —        | —    | ✅     |
| Settings          | ✅  | ✅     | —    | —        | —    | ✅     |
| Health Endpoint   | —   | —      | —    | —        | ✅   | ✅     |
| NoSQL Injection   | —   | —      | —    | ✅       | —    | ✅     |
| Rate Limiting     | —   | —      | —    | ✅       | —    | ✅     |
| JWT Validation    | —   | —      | —    | ✅       | —    | ✅     |

## Running Tests

```bash
# E2E Tests (all viewports)
npm run test:e2e

# E2E Tests (desktop only – faster)
npm run test:e2e:desktop

# E2E Tests (mobile only)
npm run test:e2e:mobile

# Security Tests only
npm run test:security

# Load Testing (full)
npm run test:load

# Load Testing (CI smoke)
npm run test:load:smoke

# Lighthouse Audit
npm run test:lighthouse

# All Tests
npm run test:all
```

## Responsive Viewports

| Profile     | Resolution | Device             |
|------------|------------|--------------------|
| Desktop    | 1440×900   | Desktop Chrome     |
| Laptop     | 1366×768   | Desktop Chrome     |
| Tablet     | 768×1024   | iPad (gen 7)       |
| Mobile     | 390×844    | iPhone 14          |

## Performance Budgets

| Metric                    | Budget   |
|--------------------------|----------|
| First Contentful Paint   | < 2000ms |
| Largest Contentful Paint | < 3000ms |
| Time to Interactive      | < 3500ms |
| Total Blocking Time      | < 300ms  |
| Cumulative Layout Shift  | < 0.1    |
