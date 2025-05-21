/**
 * Workflow App Test Example
 * 
 * This test demonstrates how to use Puppeteer to interact with the Workflow Builder UI
 */
import { describe, test, expect, beforeAll } from '@jest/globals';
import { 
  waitForTestId, 
  clickByTestId, 
  typeIntoInput, 
  takeScreenshot,
  getTextContent 
} from './puppeteer-helpers.js';

describe('Workflow Builder App', () => {
  beforeAll(async () => {
    // Navigate to the app URL
    await page.goto('http://localhost:5173');
    
    // Wait for the app to fully load
    await page.waitForSelector('body', { 
      timeout: 10000 
    }).catch(() => {
      console.warn('Warning: Body element not found. Something is seriously wrong.');
    });
    
    // Take a screenshot of the initial state
    await takeScreenshot(page, 'workflow-builder-initial');
  });
  
  test('should have page title', async () => {
    const title = await page.title();
    console.log('Actual page title:', title);
    expect(title).toBeDefined();
    // The default Vite title is fine for now
    expect(title).toContain('Vite + React');
  });
  
  test('root element exists', async () => {
    const rootElement = await page.$('#root');
    expect(rootElement).not.toBeNull();
    
    // Take a screenshot of the app
    await page.screenshot({ path: 'screenshots/app-home.png' });
  });
  
  test('can take screenshot of page body', async () => {
    // Get page content
    const bodyText = await page.evaluate(() => document.body.textContent);
    console.log('Page body text (first 100 chars):', bodyText.substring(0, 100));
    
    // Take screenshot of full page
    await page.screenshot({ 
      path: 'screenshots/full-page.png',
      fullPage: true 
    });
  });
  
  // More specific tests can be added once we understand the app structure
});
