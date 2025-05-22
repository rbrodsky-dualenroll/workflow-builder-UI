// test-environment.js
import { TestEnvironment } from 'jest-environment-puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class CustomEnvironment extends TestEnvironment {
  async setup() {
    await super.setup();
    
    // Create screenshots directory if it doesn't exist
    const screenshotsDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    
    // Add helpers to global scope
    this.global.BASE_URL = 'http://localhost:5173/workflow-builder-UI/?test=true';
  }
}
