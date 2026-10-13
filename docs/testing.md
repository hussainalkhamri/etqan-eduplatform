# Test Strategy & Quality Verification

## 1. Test Architecture

The automated test suite uses **Vitest 2.1** for near-instant execution and seamless TypeScript compatibility.

```bash
# Run automated tests
npm test
```

## 2. Test Suite Coverage

| Test Suite | Purpose & Coverage | Status |
| :--- | :--- | :---: |
| **Synthetic Seed Integrity** | Verifies catalog categories, product pricing sanity, and strict absence of original client strings. | PASS |
| **Mock Adapter Engine** | Tests `.select()`, `.eq()`, `.order()`, `.insert()`, and `.maybeSingle()` queries against localStorage. | PASS |
| **Authentication & RBAC** | Verifies 1-click admin login, session persistence, role assignment, and sign-out cleanup. | PASS |
| **Order Calculations** | Confirms pricing arithmetic and composite order totals. | PASS |

### Execution Baseline
```text
✓ src/__tests__/platform.test.ts (8 tests) 25ms

Test Files  1 passed (1)
     Tests  8 passed (8)
  Duration  1.44s
```
