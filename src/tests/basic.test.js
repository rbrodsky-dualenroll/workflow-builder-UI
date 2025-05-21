// basic.test.js

describe('Basic Test Environment', () => {
  beforeAll(async () => {
    await page.goto('http://localhost:5173');
  });

  test('Puppeteer environment is working', async () => {
    // Simple assertion to verify Jest is working
    expect(1).toBe(1);
    
    // Take a screenshot
    await page.screenshot({ path: 'screenshots/basic-test.png' });
  });
});
