# E2E Test Framework

MVP Playwright + TypeScript test framework for the frontend application.

## Quick Start

### Install dependencies
```bash
npm install -D @playwright/test
npx playwright install
```

### Run tests
```bash
npm run test:e2e          # Headless mode
npm run test:e2e:ui       # Interactive UI mode
npm run test:e2e:headed   # Show browser
```

### View report
```bash
npm run test:e2e:report
```

## Structure

```
tests/
├── e2e/                              # Test specs
│   ├── smoke.spec.ts                # Core smoke tests
│   ├── auth.spec.ts                 # Auth flow tests
│   ├── logout.spec.ts               # Logout flow tests
│   └── job-application.spec.ts      # Job browsing flow
├── pages/                            # Page Objects (POM pattern)
│   ├── LoginPage.ts                 # Login page object
│   └── JobRolesPage.ts              # Job roles list page
├── fixtures/                         # Test data (DEPRECATED - use .env)
├── utils/                            # Helper functions
│   └── helpers.ts                   # Common utilities
└── README.md                         # This file
```

## Best Practices Used

1. **Page Object Model (POM)** - Encapsulate page interactions in page classes
2. **Environment Variables** - Secure credential management via .env file
3. **Helper Functions** - Reuse common actions across tests
4. **Descriptive Test Names** - Clear, concise test descriptions
5. **Parallel Execution** - Tests run in parallel for speed
6. **Screenshot on Failure** - Automatic screenshots for debugging
7. **Trace on Retry** - Playwright traces for failed retries in CI

## Test Coverage

### ✅ Currently Tested
- Login flow (valid/invalid credentials)
- **Logout flow**
  - User can sign out
  - Redirect to login after logout
  - Session cookie cleared
  - Protected routes inaccessible
  - User email displayed when logged in
  - Sign Out button visibility
- Health check endpoint
- Page redirects and 404 handling
- Job roles browsing
- Job details viewing
- Navigation (view job → back to list)

### 🔜 Future Tests
- Job application submission (requires Open job test data)
- Form validation errors
- Session persistence (refresh maintains login)
- Session timeout (inactivity)
- Protected route guards (direct navigation)
- File upload (CV)
- Multiple job applications
- Application history/status

## Environment Variables

- `BASE_URL` - Application base URL (default: `http://localhost:3000`)
- `CI` - Set to `true` in CI environments (enables retries, single worker)

## Extending the Framework

### Add a new test file
1. Create `tests/e2e/feature.spec.ts`
2. Import page objects and test data
3. Write tests using `test()` and `test.describe()`

### Add a new page object
1. Create `tests/pages/FeaturePage.ts`
2. Extend from page actions and navigation
3. Import in test files

### Update test data
Modify `tests/fixtures/test-data.ts` and import `TEST_DATA` in tests
