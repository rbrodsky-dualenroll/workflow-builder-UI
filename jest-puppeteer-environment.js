// jest-puppeteer-environment.js
import vm from 'vm';
import { TestEnvironment } from 'jest-environment-node';
import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { ModuleMocker } from 'jest-mock';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the temporary directory
const DIR = path.join(os.tmpdir(), 'jest_puppeteer_global_setup');

class PuppeteerEnvironment extends TestEnvironment {
  constructor(config, context) {
    super(config, context);
    
    // Initialize the ModuleMocker - this is what was missing!
    this.moduleMocker = new ModuleMocker(global);
    
    // Ensure we have a browser promise
    this.browserPromise = null;
  }
  
  async setup() {
    await super.setup();
    
    try {
      // Create screenshots directory
      const screenshotsDir = path.join(__dirname, 'screenshots');
      await fs.mkdir(screenshotsDir, { recursive: true })
        .catch(() => console.log('Screenshots directory already exists'));
      
      // Get the wsEndpoint
      let wsEndpoint;
      try {
        wsEndpoint = await fs.readFile(path.join(DIR, 'wsEndpoint'), 'utf8');
        if (!wsEndpoint) {
          throw new Error('wsEndpoint not found');
        }
      } catch (err) {
        console.error('Error reading wsEndpoint:', err);
        throw new Error(`Could not find Puppeteer websocket endpoint. Make sure the browser is launched. Error: ${err.message}`);
      }
      
      // Connect to browser
      try {
        const browser = await puppeteer.connect({ 
          browserWSEndpoint: wsEndpoint 
        });
        
        // Create a new page
        const page = await browser.newPage();
        
        // Set up globals for tests
        this.global.browser = browser;
        this.global.page = page;
        this.global.puppeteer = puppeteer;
        
        console.log('PuppeteerEnvironment setup completed successfully');
      } catch (err) {
        console.error('Error connecting to browser:', err);
        throw err;
      }
    } catch (error) {
      console.error('Error in PuppeteerEnvironment setup:', error);
      throw error;
    }
  }
  
  async teardown() {
    try {
      console.log('Tearing down PuppeteerEnvironment...');
      
      // Close the page
      if (this.global.page) {
        await this.global.page.close()
          .catch(err => console.warn('Error closing page:', err.message));
      }
      
      // Disconnect from browser
      if (this.global.browser) {
        await this.global.browser.disconnect()
          .catch(err => console.warn('Error disconnecting from browser:', err.message));
      }
      
      await super.teardown();
      console.log('PuppeteerEnvironment teardown completed');
    } catch (error) {
      console.error('Error in PuppeteerEnvironment teardown:', error);
      // Don't rethrow as we're in teardown
    }
  }
  
  getVmContext() {
    return vm.createContext(this.global);
  }
}

export default PuppeteerEnvironment;
