# Puppeteer Testing with Jest in ESM Environment (2025)

This guide provides the essential setup for running Puppeteer tests with Jest in an ESM-based project.

## Installation

```bash
npm install --save-dev jest puppeteer jest-puppeteer @jest/globals
```

## Configuration Files

### jest.config.js
```javascript
export default {
  preset: 'jest-puppeteer',
  testMatch: ['**/tests/**/*.test.js'],
  testTimeout: 60000,
  verbose: true,
  transform: {},
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  }
};
```

### jest-puppeteer.config.js
```javascript
export default {
  launch: {
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: {
      width: 1280,
      height: 800
    }
  },
  browserContext: 'default'
};
```

### package.json (scripts section)
```json
"scripts": {
  "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js",
  "test:watch": "node --experimental-vm-modules node_modules/jest/bin/jest.js --watch",
  "test:ci": "node --experimental-vm-modules node_modules/jest/bin/jest.js --ci --runInBand"
}
```

## Basic Test Example

```javascript
// tests/basic.test.js
import { describe, test, expect, beforeAll } from '@jest/globals';

describe('Basic Browser Test', () => {
  beforeAll(async () => {
    await page.goto('http://localhost:5173/workflow-builder-UI/');
  });

  test('page loads correctly', async () => {
    // Take a screenshot for debugging if needed
    await page.screenshot({ path: 'screenshots/page-loaded.png' });
    
    // Simple check that the page has loaded
    const title = await page.title();
    expect(title).toBeDefined();
  });
});
```

## Running Tests

1. Start your development server:
```bash
npm run dev
```

2. Run the tests:
```bash
npm test
```

## Troubleshooting Common Issues

### Module Format Errors
If you encounter errors about CommonJS vs ESM modules, make sure:
- Your package.json has `"type": "module"` 
- You're using the `--experimental-vm-modules` flag
- All imports use the `.js` extension explicitly

### Browser Connection Issues
If tests fail to connect to the browser:
- Increase the timeout in jest.config.js
- Try running with `--runInBand` to avoid parallel test execution
- Check if your development server is running on the expected port

### Element Not Found
If selectors fail:
- Use consistent data-testid attributes
- Add waiting logic before interactions
- Take screenshots at failure points for debugging

## Best Practices

1. Use page.waitForSelector() before interacting with elements
2. Structure tests with page objects for maintainability
3. Use screenshots for debugging
4. Keep tests independent
5. Focus on user-centric behaviors rather than implementation details
