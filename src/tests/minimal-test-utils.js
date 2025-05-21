// minimal-test-utils.js
/**
 * A minimal set of test utilities for the basic test
 */

/**
 * Take a screenshot with a timestamp
 * @param {Object} page - Puppeteer page object
 * @param {string} name - Base name for the screenshot
 */
export const takeScreenshot = async (page, name) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `screenshots/${name}-${timestamp}.png`;
  await page.screenshot({ path: filename, fullPage: true });
  console.log(`Screenshot saved: ${filename}`);
};

/**
 * Wait for a specific selector to be visible
 * @param {Object} page - Puppeteer page object
 * @param {string} selector - CSS selector to wait for
 * @param {number} timeout - Timeout in milliseconds
 */
export const waitForSelector = async (page, selector, timeout = 5000) => {
  return page.waitForSelector(selector, { visible: true, timeout });
};

/**
 * Click an element by its selector
 * @param {Object} page - Puppeteer page object
 * @param {string} selector - CSS selector to click
 */
export const clickElement = async (page, selector) => {
  await waitForSelector(page, selector);
  await page.click(selector);
};

/**
 * Type text into an input field
 * @param {Object} page - Puppeteer page object
 * @param {string} selector - CSS selector for the input field
 * @param {string} text - Text to type
 */
export const typeText = async (page, selector, text) => {
  await waitForSelector(page, selector);
  await page.type(selector, text);
};

/**
 * Get text content from an element
 * @param {Object} page - Puppeteer page object
 * @param {string} selector - CSS selector for the element
 * @returns {Promise<string>} - Text content of the element
 */
export const getTextContent = async (page, selector) => {
  await waitForSelector(page, selector);
  return page.$eval(selector, el => el.textContent);
};
