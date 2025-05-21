/**
 * Puppeteer Helpers
 * 
 * Common utility functions for Puppeteer-based tests
 */

/**
 * Take a screenshot with a timestamp
 * @param {Object} page - Puppeteer page object
 * @param {string} name - Base name for the screenshot
 * @returns {Promise<string>} - Path to saved screenshot
 */
export const takeScreenshot = async (page, name) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `screenshots/${name}-${timestamp}.png`;
  await page.screenshot({ path: filename, fullPage: true });
  console.log(`Screenshot saved: ${filename}`);
  return filename;
};

/**
 * Wait for an element to be visible by its data-testid attribute
 * @param {Object} page - Puppeteer page object
 * @param {string} testId - The data-testid value
 * @param {Object} options - Options for waitForSelector
 * @returns {Promise<ElementHandle>}
 */
export const waitForTestId = async (page, testId, options = {}) => {
  return page.waitForSelector(`[data-testid="${testId}"]`, { 
    visible: true, 
    timeout: 5000, 
    ...options 
  });
};

/**
 * Click an element by its data-testid attribute
 * @param {Object} page - Puppeteer page object
 * @param {string} testId - The data-testid value
 */
export const clickByTestId = async (page, testId) => {
  const element = await waitForTestId(page, testId);
  await element.click();
};

/**
 * Type text into an input identified by data-testid
 * @param {Object} page - Puppeteer page object
 * @param {string} testId - The data-testid value
 * @param {string} text - Text to type
 */
export const typeIntoInput = async (page, testId, text) => {
  const element = await waitForTestId(page, testId);
  await element.type(text);
};

/**
 * Get text content of an element by data-testid
 * @param {Object} page - Puppeteer page object
 * @param {string} testId - The data-testid value
 * @returns {Promise<string>} Element text content
 */
export const getTextContent = async (page, testId) => {
  await waitForTestId(page, testId);
  return page.$eval(`[data-testid="${testId}"]`, el => el.textContent);
};

/**
 * Wait for a selector to be visible
 * @param {Object} page - Puppeteer page object
 * @param {string} selector - CSS selector
 * @param {Object} options - Options for waitForSelector
 * @returns {Promise<ElementHandle>}
 */
export const waitForSelector = async (page, selector, options = {}) => {
  return page.waitForSelector(selector, { 
    visible: true, 
    timeout: 5000, 
    ...options 
  });
};

/**
 * Check if an element exists on the page
 * @param {Object} page - Puppeteer page object
 * @param {string} selector - CSS selector
 * @returns {Promise<boolean>} Whether the element exists
 */
export const elementExists = async (page, selector) => {
  const element = await page.$(selector);
  return element !== null;
};

/**
 * Wait for a specified amount of time
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 */
export const wait = async (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
