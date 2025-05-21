# Common Testing Patterns

This document provides common patterns and helper functions for testing the Workflow Builder application with Puppeteer.

## Basic Setup

```javascript
// Basic setup for Puppeteer tests
const puppeteer = require('puppeteer');

const setup = async () => {
  // Launch browser
  const browser = await puppeteer.launch({
    headless: false, // Set to true for headless testing
    defaultViewport: { width: 1280, height: 800 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  // Create a new page
  const page = await browser.newPage();
  
  // Navigate to the application
  await page.goto('http://localhost:5173');
  
  // Wait for the app container
  await page.waitForSelector('[data-testid="app-container"]', { timeout: 5000 })
    .catch(() => console.warn('App container not found, proceeding anyway'));
  
  // Wait for UI elements to be interactive
  await page.waitForSelector('[data-testid="add-step-button"]');
  
  return { browser, page };
};

// Example usage
const testWorkflowBuilder = async () => {
  const { browser, page } = await setup();
  
  try {
    // Test code goes here
    // ...
  } catch (error) {
    console.error('Test failed:', error);
    
    // Take a screenshot when an error occurs
    await page.screenshot({ path: 'error-screenshot.png' });
  } finally {
    // Close browser
    await browser.close();
  }
};

testWorkflowBuilder();
```

## Wait for Application Container

```javascript
// Wait for the application container to be fully loaded before proceeding
const waitForAppContainer = async (page, timeout = 5000) => {
  try {
    await page.waitForSelector('[data-testid="app-container"]', { 
      visible: true, 
      timeout 
    });
    console.log('App container loaded successfully');
    return true;
  } catch (error) {
    console.warn('Warning: App container not found within timeout');
    // Take a screenshot to help debug the issue
    await page.screenshot({ path: 'app-container-not-found.png' });
    return false;
  }
};

// Example usage in setup
const setup = async () => {
  // Launch browser and navigate to app
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173');
  
  // Wait for app container and handle failure
  const appLoaded = await waitForAppContainer(page);
  if (!appLoaded) {
    console.warn('Proceeding without app container - some tests may fail');
  }
  
  return { browser, page };
};
```

## Screenshot Utility

```javascript
// Helper function to take screenshots at key points
const takeScreenshot = async (page, name) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const path = `screenshots/${name}-${timestamp}.png`;
  await page.screenshot({ path, fullPage: true });
  console.log(`Screenshot saved: ${path}`);
  return path;
};

// Example usage
await takeScreenshot(page, 'initial-state');
// ... perform some actions
await takeScreenshot(page, 'after-add-step');
```

## Wait Utilities

```javascript
// Helper function to wait for an element to be visible
const waitForVisible = async (page, selector, timeout = 5000) => {
  await page.waitForSelector(selector, { visible: true, timeout });
};

// Helper function to wait for an element to be clickable
const waitForClickable = async (page, selector, timeout = 5000) => {
  await page.waitForSelector(selector, { visible: true, timeout });
  await page.waitForFunction(
    (s) => {
      const el = document.querySelector(s);
      return el && !el.disabled && !el.getAttribute('disabled');
    },
    { timeout },
    selector
  );
};

// Helper function to wait for animations to complete
const waitForAnimations = async (page, timeout = 500) => {
  await page.waitForTimeout(timeout);
};

// Example usage
await waitForVisible(page, '[data-testid="add-step-button"]');
await waitForClickable(page, '[data-testid="modal-save-button"]');
await waitForAnimations(page);
```

## Creating a Complete Workflow

```javascript
// Helper function to create a complete workflow with multiple steps
const createTestWorkflow = async (page) => {
  // Add first step (College Approval)
  await page.click('[data-testid="add-step-button"]');
  await page.waitForSelector('[data-testid="modal-content"]');
  await page.select('[data-testid="step-form-type"]', 'Approval');
  await page.type('[data-testid="step-form-title"]', 'College Approval');
  await page.select('[data-testid="field-role"]', 'College');
  await page.select('[data-testid="field-workflow-category"]', 'Per Course');
  await page.click('[data-testid="modal-save-button"]');
  await page.waitForSelector('[data-testid^="workflow-step-"]');
  
  // Add second step (High School Approval)
  await page.click('[data-testid="add-step-button"]');
  await page.waitForSelector('[data-testid="modal-content"]');
  await page.select('[data-testid="step-form-type"]', 'Approval');
  await page.type('[data-testid="step-form-title"]', 'High School Approval');
  await page.select('[data-testid="field-role"]', 'High School');
  await page.select('[data-testid="field-workflow-category"]', 'Per Course');
  await page.click('[data-testid="modal-save-button"]');
  
  // Add third step (Student Upload)
  await page.click('[data-testid="add-step-button"]');
  await page.waitForSelector('[data-testid="modal-content"]');
  await page.select('[data-testid="step-form-type"]', 'Document Upload');
  await page.type('[data-testid="step-form-title"]', 'Student Upload Document');
  await page.select('[data-testid="field-role"]', 'Student');
  await page.select('[data-testid="field-workflow-category"]', 'Once Ever');
  
  // Add file upload option (need to scroll down to see it)
  await page.evaluate(() => {
    document.querySelector('[data-testid="modal-content"]').scrollTop = 1000;
  });
  await page.type('[data-testid="file-label-input"]', 'Transcript');
  await page.type('[data-testid="file-type-input"]', 'pdf');
  await page.click('[data-testid="add-file-button"]');
  await page.click('[data-testid="modal-save-button"]');
  
  // Get all step IDs
  const stepIds = await page.evaluate(() => {
    const steps = document.querySelectorAll('[data-testid^="workflow-step-"]');
    return Array.from(steps).map(step => step.getAttribute('data-step-id'));
  });
  
  return stepIds;
};

// Example usage
const stepIds = await createTestWorkflow(page);
console.log('Created workflow with steps:', stepIds);
```


## Verifying Workflow Structure

```javascript
// Helper function to verify the structure of a workflow
const verifyWorkflowStructure = async (page) => {
  return page.evaluate(() => {
    const steps = document.querySelectorAll('[data-testid^="workflow-step-"]');
    
    const structure = Array.from(steps).map(step => ({
      id: step.getAttribute('data-step-id'),
      title: step.querySelector('.step-title').textContent.trim(),
      role: step.getAttribute('data-step-role'),
      isFeedback: step.getAttribute('data-is-feedback') === 'true',
      parentId: step.getAttribute('data-parent-id') || null,
      index: parseInt(step.getAttribute('data-step-index') || '0', 10)
    }));
    
    // Verify steps are in the correct order
    const stepsInOrder = structure.every((step, i, arr) => {
      if (i === 0) return true;
      return step.index > arr[i-1].index;
    });
    
    // Verify feedback steps come after their parents
    const feedbackStepsAfterParents = structure.filter(s => s.isFeedback).every(feedbackStep => {
      const parentStep = structure.find(s => s.id === feedbackStep.parentId);
      return parentStep && structure.indexOf(feedbackStep) > structure.indexOf(parentStep);
    });
    
    return {
      steps: structure,
      stepsInOrder,
      feedbackStepsAfterParents
    };
  });
};

// Example usage
const workflowStructure = await verifyWorkflowStructure(page);
console.log('Workflow structure:', workflowStructure.steps);
console.log('Steps in order:', workflowStructure.stepsInOrder);
console.log('Feedback steps after parents:', workflowStructure.feedbackStepsAfterParents);
```

## Error Handling

```javascript
// Wrapper for actions that might fail
const safeAction = async (action, errorMessage) => {
  try {
    await action();
    return true;
  } catch (error) {
    console.error(`${errorMessage}: ${error.message}`);
    return false;
  }
};

// Example usage
const success = await safeAction(
  async () => {
    await page.click('[data-testid="add-step-button"]');
    await page.waitForSelector('[data-testid="modal-content"]');
  },
  'Failed to open add step modal'
);

if (!success) {
  // Handle failure case
  console.log('Taking a screenshot to debug the issue');
  await page.screenshot({ path: 'error-state.png' });
}
```

## Tips for Robust Testing

1. **Always wait for elements**: Never assume an element will be immediately available after an action.
2. **Take screenshots**: Use screenshots to debug issues, especially when elements are not found.
3. **Handle exceptions**: Wrap critical sections in try/catch blocks to handle exceptions gracefully.
4. **Verify state**: After performing actions, verify that the application state changed as expected.
5. **Use timeouts wisely**: Set appropriate timeouts for waitForSelector and other waiting operations.
6. **Scroll when needed**: Remember to scroll to access elements that are outside the viewport.
7. **Clean up**: Always close the browser, even if tests fail.
8. **Use data attributes**: Always use data-testid attributes for selecting elements.
