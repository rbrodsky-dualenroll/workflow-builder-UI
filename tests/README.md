# Puppeteer Jest Test Setup

This directory contains automated tests for the Workflow Builder application using Jest and Puppeteer.

## Running Tests

First, make sure the development server is running:

```bash
npm run dev
```

Then, in a separate terminal, run the tests:

```bash
npm run test:jest
```

For CI/CD environments:

```bash
npm run test:ci
```

## Test Files

- **basic.test.js** - Simple test to verify the Jest + Puppeteer setup is working
- **workflow-app.test.js** - Tests specific to the Workflow Builder functionality
- **single-step.test.js** - Basic tests focused on creating and editing a single workflow step
- **puppeteer-helpers.js** - Helper functions for working with Puppeteer

## Helper Functions

The `puppeteer-helpers.js` file provides utility functions for common operations:

- `waitForTestId(page, testId, options)` - Wait for an element with a specific data-testid
- `clickByTestId(page, testId)` - Click an element by its data-testid
- `typeIntoInput(page, testId, text)` - Type text into an input field
- `takeScreenshot(page, name)` - Take a screenshot with a timestamp
- `getTextContent(page, testId)` - Get text content from an element
- `elementExists(page, selector)` - Check if an element exists on the page

## Debugging Failed Tests

All tests automatically take screenshots at key points, which are saved to the `/screenshots` directory. If a test fails, check the screenshots to see what state the UI was in at the time of failure.

## Adding More Tests

When adding new tests, follow these guidelines:

1. Use data-testid attributes for all element selections
2. Always use `waitForTestId()` before interacting with elements
3. Take screenshots at important steps using `takeScreenshot()`
4. Keep tests independent from each other
5. Focus on testing user-visible behaviors rather than implementation details
