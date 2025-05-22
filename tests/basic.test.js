/**
 * Very basic test to verify the test environment works
 */
import { describe, test, expect, jest } from '@jest/globals';

describe('Basic Test', () => {
  // Simple test to verify Puppeteer integration
  test('should have browser and page objects', () => {
    // Verify global browser and page objects exist
    expect(browser).toBeDefined();
    expect(page).toBeDefined();
    console.log('Browser and page objects are properly defined');
  });
  
  test('can navigate to app', async () => {
    // Navigate to app
    await page.goto('http://localhost:5173/workflow-builder-UI/?test=true');
    console.log('Successfully navigated to app');
    
    // Get page title
    const title = await page.title();
    console.log(`Page title: "${title}"`);
    
    // Take a screenshot
    await page.screenshot({ path: 'screenshots/basic-test.png' });
    console.log('Screenshot saved');
    
    // Simple assertion
    expect(title).toBeDefined();
  });
  
  test('mocks work', () => {
    // Create a mock function
    const mockFn = jest.fn();
    mockFn('test');
    
    // Verify mock functionality works
    expect(mockFn).toHaveBeenCalledWith('test');
    console.log('Mocking functionality works correctly');
  });
});
