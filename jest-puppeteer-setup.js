// jest-puppeteer-setup.js
import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a temporary directory for the websocket endpoint file
const DIR = path.join(os.tmpdir(), 'jest_puppeteer_global_setup');

// Setup function
export default async function globalSetup() {
  try {
    console.log('\nStarting Puppeteer global setup...');
    
    // Create screenshots directory
    const screenshotsDir = path.join(__dirname, 'screenshots');
    try {
      await fs.mkdir(screenshotsDir, { recursive: true });
      console.log(`Created/verified screenshots directory at ${screenshotsDir}`);
    } catch (err) {
      // Directory may already exist
      console.log(`Note: ${err.message}`);
    }
    
    // Launch the browser
    console.log('Launching Puppeteer browser instance...');
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: {
        width: 1280,
        height: 800
      }
    });
    
    // Store the browser instance so we can teardown it later
    global.__BROWSER__ = browser;
    
    // Store the browser wsEndpoint for use in tests
    global.__BROWSER_ENDPOINT__ = browser.wsEndpoint();
    console.log('Browser launched with endpoint:', browser.wsEndpoint());
    
    // Use the file system to expose the wsEndpoint for TestEnvironments
    try {
      await fs.mkdir(DIR, { recursive: true });
      await fs.writeFile(path.join(DIR, 'wsEndpoint'), browser.wsEndpoint());
      console.log(`WebSocket endpoint saved to ${path.join(DIR, 'wsEndpoint')}`);
    } catch (err) {
      console.error('Error saving wsEndpoint:', err);
      throw err;
    }
    
    console.log('Puppeteer global setup completed.\n');
  } catch (error) {
    console.error('Error in Puppeteer global setup:', error);
    // Rethrow the error to fail the tests
    throw error;
  }
}
