// custom-puppeteer-environment.js
const { PuppeteerEnvironment } = require('jest-environment-puppeteer');
const fs = require('fs');
const path = require('path');

class CustomPuppeteerEnvironment extends PuppeteerEnvironment {
  async setup() {
    await super.setup();
    
    // Add globals for testing
    this.global.BASE_URL = process.env.TEST_URL || 'http://localhost:5173/workflow-builder-UI/?test=true';
    
    // Override waitForTimeout to support async/await better
    this.global.waitForTimeout = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    // Create screenshots directory if it doesn't exist
    const screenshotsDir = path.join(process.cwd(), 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    
    // Add helper to take and save screenshots with timestamp
    this.global.takeScreenshot = async (name) => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${name}-${timestamp}.png`;
      const path = `./screenshots/${filename}`;
      await this.global.page.screenshot({ path, fullPage: true });
      console.log(`Screenshot saved: ${path}`);
      return path;
    };
  }
}

module.exports = CustomPuppeteerEnvironment;
