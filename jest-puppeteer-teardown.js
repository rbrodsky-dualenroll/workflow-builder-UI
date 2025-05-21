// jest-puppeteer-teardown.js
import path from 'path';
import os from 'os';
import fs from 'fs/promises';

// Path to the temporary directory
const DIR = path.join(os.tmpdir(), 'jest_puppeteer_global_setup');

// Teardown function
export default async function globalTeardown() {
  try {
    console.log('\nStarting Puppeteer global teardown...');
    
    // Close the browser instance
    if (global.__BROWSER__) {
      console.log('Closing browser...');
      await global.__BROWSER__.close()
        .catch(err => console.warn('Error closing browser:', err.message));
    }
    
    // Clean up the wsEndpoint file
    try {
      console.log(`Removing temporary directory ${DIR}...`);
      await fs.rm(DIR, { recursive: true, force: true });
    } catch (err) {
      console.warn('Error cleaning up temporary directory:', err.message);
      // Don't fail teardown if cleanup fails
    }
    
    console.log('Puppeteer global teardown completed.\n');
  } catch (error) {
    console.error('Error in Puppeteer global teardown:', error);
    // Don't rethrow the error as we're in teardown
  }
}
