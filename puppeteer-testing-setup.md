# Puppeteer Testing Framework Setup

This document outlines the necessary libraries and configuration for setting up a headless Puppeteer testing framework with Jest.

## Required Libraries

Run the following command to install all necessary libraries:

```bash
npm install --save-dev jest jest-puppeteer puppeteer jest-environment-puppeteer expect-puppeteer @jest/globals
```

For additional functionality, you might also want:

```bash
npm install --save-dev @types/jest @types/puppeteer jest-image-snapshot
```

## Configuration Files

The minimal testing setup requires the following configuration files:

1. **jest.config.js**: Main Jest configuration file
2. **jest-puppeteer.config.js**: Puppeteer-specific configuration
3. **test-environment.js**: Custom environment setup

## Running Tests in CI/CD

For headless CI/CD environments, add the following to your CI configuration:

```yaml
# Example GitHub Actions workflow snippet
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Start development server
        run: npm run dev & npx wait-on http://localhost:5173
      - name: Run tests
        run: npm run test:ci
      - name: Upload screenshots
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-screenshots
          path: screenshots
```

## Best Practices

1. **Always use data-testid attributes** for selecting elements to make tests more resilient to UI changes
2. **Take screenshots during key steps** to help with debugging
3. **Keep tests independent** from each other
4. **Wait for elements to be visible** before interacting with them
5. **Handle timing issues** by using proper wait strategies instead of arbitrary delays
6. **Clean up after tests** to ensure a clean state for the next test

## Troubleshooting

Common issues and solutions:

1. **Test timeouts**: Increase the timeout in jest.config.js
2. **Element not found**: Check if you're waiting for the element to be visible before interacting
3. **Test flakiness**: Implement proper waits and avoid relying on timing
4. **Browser crashes**: Check memory usage and consider running fewer tests in parallel

## Next Steps

After establishing this basic setup, you can:

1. Create a robust page object model for your application
2. Implement data-driven testing
3. Add visual regression testing
4. Set up reporting and monitoring
5. Create a CI/CD pipeline
