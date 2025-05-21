# Workflow Builder Tests

This directory contains automated tests for the Workflow Builder application.

## Setup

The tests use Puppeteer and Jest. To run the tests, you need to:

1. Start the development server:
```bash
npm run dev
```

2. In a separate terminal, run the tests:
```bash
npm run test:jest
```

For running a single test file:
```bash
npm run test:basic
```

## Test Structure

- **basic.test.js**: Simple tests to verify the testing environment is working
- **workflow-steps.test.js**: Tests for basic workflow step operations
- **feedback-loops.test.js**: Tests specifically for feedback loop functionality

## Test Utilities

The tests use these utility files:

- **minimal-test-utils.js**: Basic utilities for interacting with the page
- **/src/utils/puppeteerTestUtils.js**: Application-specific test utilities

## Screenshots

All tests save screenshots to the `/screenshots` directory for debugging purposes.

## Troubleshooting

If the tests fail:

1. Make sure the development server is running at http://localhost:5173
2. Check that the app has the expected data-testid attributes
3. Review the screenshots in the screenshots directory
4. Look for errors in the browser console (captured in the test output)

## CI/CD Integration

For CI/CD environments, use:

```bash
npm run test:ci
```

This runs the tests in headless mode with additional flags suitable for CI environments.
