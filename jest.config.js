// jest.config.js
export default {
  // Use our custom setup/teardown/environment
  globalSetup: './jest-puppeteer-setup.js',
  globalTeardown: './jest-puppeteer-teardown.js',
  testEnvironment: './jest-puppeteer-environment.js',
  
  // Basic configuration
  testMatch: ['**/tests/**/*.test.js', '**/src/tests/**/*.test.js'],
  testTimeout: 30000,
  verbose: true,
  
  // Module handling for ESM
  transform: {},
  
  // Show console output during tests 
  silent: false
};
