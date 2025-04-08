# Troubleshooting

This document provides guidance on common issues encountered when testing the Workflow Builder application with Puppeteer and how to resolve them.

## Common Issues and Solutions

### Elements Not Found

**Problem**: Puppeteer cannot find an element using a selector.

**Solutions**:
1. **Wait for the element**: Elements may not be immediately available after an action. Always use `page.waitForSelector()` before interacting with an element.

```javascript
// Incorrect
await page.click('[data-testid="add-step-button"]');
await page.click('[data-testid="step-form-type"]');

// Correct
await page.click('[data-testid="add-step-button"]');
await page.waitForSelector('[data-testid="step-form-type"]');
await page.click('[data-testid="step-form-type"]');
```

2. **Check for typos in selectors**: Ensure the selector is correct and matches what's in the application.

3. **Take screenshots**: Use screenshots to see the state of the application when the error occurs.

```javascript
await page.screenshot({ path: 'debug-screenshot.png' });
```

4. **Check element visibility**: The element might be in the DOM but not visible. Use the `visible: true` option.

```javascript
await page.waitForSelector('[data-testid="modal-content"]', { visible: true });
```

5. **Verify existence first**: Check if the element exists before trying to interact with it.

```javascript
const elementExists = await page.evaluate((selector) => {
  return document.querySelector(selector) !== null;
}, '[data-testid="some-element"]');

if (elementExists) {
  // Proceed with interaction
} else {
  console.error('Element not found in the DOM');
  // Take debug actions
}
```

### Element Not Interactable

**Problem**: An element is found but cannot be clicked or interacted with.

**Solutions**:
1. **Check if element is covered**: Elements might be covered by other elements like overlays or tooltips.

2. **Scroll into view**: The element might be outside the viewport.

```javascript
// Scroll to make the element visible
await page.evaluate((selector) => {
  const element = document.querySelector(selector);
  if (element) {
    element.scrollIntoView();
  }
}, '[data-testid="some-element"]');

// For elements inside a modal
await page.evaluate(() => {
  document.querySelector('[data-testid="modal-content"]').scrollTop = 1000;
});
```

3. **Check for disabled state**: The element might be disabled.

```javascript
const isDisabled = await page.evaluate((selector) => {
  const element = document.querySelector(selector);
  return element ? element.disabled || element.getAttribute('disabled') !== null : true;
}, '[data-testid="modal-save-button"]');

if (isDisabled) {
  console.log('Button is disabled, cannot click');
}
```

4. **Use JavaScript click**: If all else fails, try using JavaScript to click the element.

```javascript
await page.evaluate((selector) => {
  const element = document.querySelector(selector);
  if (element) {
    element.click();
  }
}, '[data-testid="some-element"]');
```

### Timing Issues

**Problem**: Actions happen too quickly, or the application doesn't update in time.

**Solutions**:
1. **Add explicit waits**: Wait for specific elements or conditions rather than fixed timeouts.

```javascript
// Wait for an element to appear
await page.waitForSelector('[data-testid="feedback-success-message"]');

// Wait for an element to disappear
await page.waitForFunction(() => {
  return document.querySelector('[data-testid="feedback-success-message"]') === null;
});
```

2. **Wait for animations**: Some UI updates involve animations that take time.

```javascript
// Wait a short time for animations to complete
await page.waitForTimeout(500);
```

3. **Wait for network requests**: For operations that involve API calls, wait for network requests to complete.

```javascript
// Wait for network requests to finish
await page.waitForFunction(() => {
  return document.readyState === 'complete' && !document.querySelector('.loading-indicator');
});
```

### Select Options Not Working

**Problem**: `page.select()` doesn't work correctly with dropdown options.

**Solutions**:
1. **Use exact text values**: Make sure you're using the exact text value from the dropdown, not a representation of it.

```javascript
// Incorrect
await page.select('[data-testid="field-role"]', 'high_school');

// Correct
await page.select('[data-testid="field-role"]', 'High School');
```

2. **Check available options**: List all available options to ensure the value exists.

```javascript
const options = await page.evaluate((selector) => {
  const select = document.querySelector(selector);
  return Array.from(select.options).map(option => ({
    value: option.value,
    text: option.text
  }));
}, '[data-testid="field-role"]');

console.log('Available options:', options);
```

### Modal Dialog Issues

**Problem**: Problems with modal dialogs, like not being able to close them or interact with elements.

**Solutions**:
1. **Wait for modals**: Always wait for the modal to fully appear before interacting with it.

```javascript
await page.waitForSelector('[data-testid="modal-content"]');
```

2. **Check for overlays**: Ensure no transparent overlays are blocking interaction.

3. **Use proper close methods**: Use the provided close buttons rather than escape key or clicking outside.

```javascript
// Close using the X button
await page.click('[data-testid="modal-close-button"]');

// Or close using the Cancel button
await page.click('[data-testid="modal-cancel-button"]');
```

4. **Handle stacked modals**: If multiple modals might be open, handle them in the correct order.

### Known Application Limitations

1. **Scenario Management Limitations**: The current implementation only allows for creating and deleting scenarios, but not editing existing ones (including their conditions).

2. **Inconsistent Scenario Tab IDs**: Scenario tabs might not follow a consistent naming pattern, making them harder to select in tests.

3. **Missing File Upload Attributes**: Some elements in the file upload section might be missing proper data-testid attributes, requiring workarounds.

4. **Select Option Capitalization**: Select options must be selected using the exact displayed text with proper capitalization.

5. **Feedback Step Order**: Moving parent steps will also move their feedback children, which might cause issues with step index validation.

## Debugging Techniques

### Console Logs

View the browser console for JavaScript errors:

```javascript
// Listen for console messages
page.on('console', msg => {
  console.log(`Browser console: ${msg.text()}`);
});

// Log from page context
await page.evaluate(() => {
  console.log('Current DOM state:', document.body.innerHTML);
});
```

### DOM Inspection

Examine the DOM structure to understand what elements are available:

```javascript
// Get the HTML of a specific element
const html = await page.evaluate((selector) => {
  const element = document.querySelector(selector);
  return element ? element.outerHTML : 'Element not found';
}, '[data-testid="modal-content"]');

console.log('Element HTML:', html);
```

### Step-by-Step Verification

Break down complex operations and verify each step:

```javascript
// Example of step-by-step verification for adding a step
const addStepWithVerification = async (page) => {
  console.log('1. Clicking add step button');
  await page.click('[data-testid="add-step-button"]');
  
  console.log('2. Waiting for modal to appear');
  await page.waitForSelector('[data-testid="modal-content"]');
  
  console.log('3. Selecting step type');
  await page.select('[data-testid="step-form-type"]', 'Approval');
  
  console.log('4. Entering step title');
  await page.type('[data-testid="step-form-title"]', 'Test Step');
  
  console.log('5. Selecting role');
  await page.select('[data-testid="field-role"]', 'College');
  
  console.log('6. Saving the step');
  await page.click('[data-testid="modal-save-button"]');
  
  console.log('7. Waiting for modal to close');
  await page.waitForFunction(() => {
    return document.querySelector('[data-testid="modal-content"]') === null;
  });
  
  console.log('8. Verifying step was added');
  const stepAdded = await page.evaluate(() => {
    return document.querySelectorAll('[data-testid^="workflow-step-"]').length > 0;
  });
  
  return stepAdded;
};
```

### Screenshots at Key Points

Take screenshots at key points in the test to understand the state of the application:

```javascript
const screenshotSequence = async (page, testName) => {
  // Create screenshots directory if it doesn't exist
  const fs = require('fs');
  const dir = './screenshots';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  
  // Take screenshots at key points
  let counter = 1;
  
  const takeScreenshot = async (name) => {
    const filename = `${dir}/${testName}_${counter++}_${name}.png`;
    await page.screenshot({ path: filename, fullPage: true });
    console.log(`Screenshot saved: ${filename}`);
  };
  
  // Initial state
  await takeScreenshot('initial');
  
  // Click add step
  await page.click('[data-testid="add-step-button"]');
  await page.waitForSelector('[data-testid="modal-content"]');
  await takeScreenshot('modal_open');
  
  // Fill form
  await page.select('[data-testid="step-form-type"]', 'Approval');
  await page.type('[data-testid="step-form-title"]', 'Test Step');
  await page.select('[data-testid="field-role"]', 'College');
  await takeScreenshot('form_filled');
  
  // Save form
  await page.click('[data-testid="modal-save-button"]');
  await page.waitForFunction(() => {
    return document.querySelector('[data-testid="modal-content"]') === null;
  });
  await takeScreenshot('step_added');
};
```

### Performance Issues

If tests are running slowly, optimize your test scripts:

1. **Reduce wait times**: Use specific element selectors instead of timeouts.
2. **Run in headless mode**: Use `headless: true` in production environments.
3. **Limit screenshots**: Only take screenshots when necessary.
4. **Batch operations**: Group similar operations together.
5. **Use page.evaluate efficiently**: Minimize the number of calls to page.evaluate.

### Browser Context Management

For more complex test suites, manage browser contexts efficiently:

```javascript
// Create a reusable browser instance
let browser;

beforeAll(async () => {
  browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1280, height: 800 }
  });
});

afterAll(async () => {
  await browser.close();
});

// Create a new page for each test
let page;

beforeEach(async () => {
  page = await browser.newPage();
  await page.goto('http://localhost:5173');
  await page.waitForSelector('[data-testid="add-step-button"]');
});

afterEach(async () => {
  await page.close();
});
```

## Reporting Issues

When reporting issues with the application or test automation, include:

1. **Clear steps to reproduce**: Provide a detailed sequence of actions.
2. **Expected vs. actual behavior**: Explain what you expected to happen and what actually happened.
3. **Screenshots/videos**: Attach visual evidence of the issue.
4. **Console logs**: Include any error messages from the browser console.
5. **Element selectors**: Note which selectors were used or missing.
6. **Environment details**: Browser version, OS, screen resolution, etc.

## Proposing Improvements

If you identify missing data-testid attributes or other improvements that would make testing easier:

1. **Document the issue**: Note which elements lack proper attributes.
2. **Suggest attribute names**: Follow the established naming patterns.
3. **Provide code examples**: Show how the attribute would be used in tests.
4. **Consider test impact**: Explain how the change would improve test reliability.

## Conclusion

Testing web applications with Puppeteer can be challenging, but with proper techniques and good application instrumentation, it becomes much more reliable. Always prioritize adding proper data-testid attributes to components before writing tests, and follow the established patterns for consistent and maintainable test code.

Remember that the goal is to create reliable, maintainable tests that verify application functionality without being brittle or flaky. Take the time to understand the application structure and add appropriate test hooks rather than relying on complex selectors or timing hacks.
