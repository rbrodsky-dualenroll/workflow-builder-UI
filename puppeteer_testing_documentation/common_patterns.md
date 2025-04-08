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
  
  // Wait for the page to load completely
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
  await page.select('[data-testid="field-subworkflow"]', 'Per Course');
  await page.click('[data-testid="modal-save-button"]');
  await page.waitForSelector('[data-testid^="workflow-step-"]');
  
  // Add second step (High School Approval)
  await page.click('[data-testid="add-step-button"]');
  await page.waitForSelector('[data-testid="modal-content"]');
  await page.select('[data-testid="step-form-type"]', 'Approval');
  await page.type('[data-testid="step-form-title"]', 'High School Approval');
  await page.select('[data-testid="field-role"]', 'High School');
  await page.select('[data-testid="field-subworkflow"]', 'Per Course');
  await page.click('[data-testid="modal-save-button"]');
  
  // Add third step (Student Upload)
  await page.click('[data-testid="add-step-button"]');
  await page.waitForSelector('[data-testid="modal-content"]');
  await page.select('[data-testid="step-form-type"]', 'Document Upload');
  await page.type('[data-testid="step-form-title"]', 'Student Upload Document');
  await page.select('[data-testid="field-role"]', 'Student');
  await page.select('[data-testid="field-subworkflow"]', 'Once Ever');
  
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

## Creating a Scenario with Conditions

```javascript
// Helper function to create a scenario with a condition
const createTestScenario = async (page, name, conditionName, conditionValue) => {
  // Click the New Scenario button
  await page.click('[data-testid="new-scenario-button"]');
  await page.waitForSelector('[data-testid="scenario-name-input"]');
  
  // Fill in the scenario name
  await page.type('[data-testid="scenario-name-input"]', name);
  
  // Expand the scenario conditions section
  await page.click('[data-testid="scenario-conditions-section-expander"]');
  await page.waitForTimeout(500);
  
  // Add a new condition
  await page.click('[data-testid="add-scenario-condition-button"]');
  await page.waitForSelector('[data-testid="scenario-condition-name-input"]');
  
  // Fill in the condition
  await page.type('[data-testid="scenario-condition-name-input"]', conditionName);
  
  // For simple conditions, we can just save without setting up complex logic
  await page.click('[data-testid="scenario-condition-save-button"]');
  
  // Select the condition
  await page.waitForSelector(`[data-testid="scenario-condition-radio-${conditionName}"]`);
  await page.click(`[data-testid="scenario-condition-radio-${conditionName}"]`);
  
  // Create the scenario
  await page.click('[data-testid="scenario-modal-create-button"]');
  
  // Wait for the scenario tab to appear and return its ID
  await page.waitForSelector('[data-testid^="scenario-tab-"]:not([data-testid="scenario-tab-main"])');
  
  // Get the scenario ID
  const scenarioId = await page.evaluate(() => {
    const scenarioTab = document.querySelector('[data-testid^="scenario-tab-"]:not([data-testid="scenario-tab-main"])');
    return scenarioTab ? scenarioTab.getAttribute('data-testid').replace('scenario-tab-', '') : null;
  });
  
  return scenarioId;
};

// Example usage
const scenarioId = await createTestScenario(page, 'Homeschool Students', 'homeschool_student');
console.log('Created scenario with ID:', scenarioId);
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

## Full Test Example

```javascript
const puppeteer = require('puppeteer');

// Full example of a test that creates a workflow and scenario
const runWorkflowBuilderTest = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 800 }
  });
  
  const page = await browser.newPage();
  
  try {
    // Navigate to the application
    await page.goto('http://localhost:5173');
    await page.waitForSelector('[data-testid="add-step-button"]');
    
    // Create a basic workflow
    console.log('Creating main workflow...');
    await createTestWorkflow(page);
    
    // Create a scenario
    console.log('Creating scenario...');
    const scenarioId = await createTestScenario(page, 'Homeschool Students', 'homeschool_student');
    
    // Switch to the scenario
    console.log('Switching to scenario...');
    await page.click(`[data-testid^="scenario-tab-${scenarioId}"]`);
    
    // Add a scenario-specific step
    console.log('Adding scenario-specific step...');
    await page.click('[data-testid="add-step-button"]');
    await page.waitForSelector('[data-testid="modal-content"]');
    await page.select('[data-testid="step-form-type"]', 'Document Upload');
    await page.type('[data-testid="step-form-title"]', 'Parent Upload MOU');
    await page.select('[data-testid="field-role"]', 'Parent');
    await page.select('[data-testid="field-subworkflow"]', 'Once Ever');
    
    // Add file upload option
    await page.evaluate(() => {
      document.querySelector('[data-testid="modal-content"]').scrollTop = 1000;
    });
    await page.type('[data-testid="file-label-input"]', 'MOU Document');
    await page.type('[data-testid="file-type-input"]', 'pdf');
    await page.click('[data-testid="add-file-button"]');
    await page.click('[data-testid="modal-save-button"]');
    
    // Toggle Master View
    console.log('Toggling Master View...');
    await page.click('[data-testid="master-view-button"]');
    
    // Verify the workflow structure
    console.log('Verifying workflow structure...');
    const structure = await verifyWorkflowStructure(page);
    console.log('Verified structure:', structure.stepsInOrder && structure.feedbackStepsAfterParents);
    
    // Save the workflow
    console.log('Saving workflow...');
    await page.click('[data-testid="save-workflow-button"]');
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
    await page.screenshot({ path: 'test-failure.png' });
  } finally {
    await browser.close();
  }
};

runWorkflowBuilderTest();
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
