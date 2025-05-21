/**
 * Test Helpers
 * 
 * This file contains functions to help with testing the workflow builder
 * using Jest and Puppeteer. It builds on the existing puppeteerTestUtils.js
 */

import { 
  createTestWorkflow, 
  getWorkflowStepOrder, 
  setupTestWorkflow,
  validateFeedbackRelationships,
  validateParentChildIDs 
} from '../utils/puppeteerTestUtils.js';

/**
 * Initialize the workflow builder app with test data
 * @param {Object} page - Puppeteer page object
 * @param {Array} customSteps - Optional custom steps to use instead of default test workflow
 * @returns {Promise<void>}
 */
export const initializeWorkflowBuilder = async (page, customSteps = null) => {
  // Navigate to the app
  await page.goto('http://localhost:5173');
  
  // Wait for the main container to be visible
  await page.waitForSelector('[data-testid="app-container"]', { visible: true })
    .catch(() => {
      console.warn('Warning: App container not found, continuing anyway');
    });
  
  // Set up the test workflow
  await setupTestWorkflow(page, customSteps || createTestWorkflow());
  
  // Take a screenshot to verify initialization
  await page.screenshot({ path: 'screenshots/initialized-app.png' });
  
  return page;
};

/**
 * Assert that step order matches expected order
 * @param {Object} page - Puppeteer page object
 * @param {Array<string>} expectedOrder - Expected step IDs in order
 * @returns {Promise<void>}
 */
export const assertStepOrder = async (page, expectedOrder) => {
  const currentOrder = await getWorkflowStepOrder(page);
  expect(currentOrder).toEqual(expectedOrder);
};

/**
 * Assert that feedback relationships are valid
 * @param {Object} page - Puppeteer page object
 * @returns {Promise<Object>} - Validation results object
 */
export const assertValidFeedbackRelationships = async (page) => {
  const validation = await validateFeedbackRelationships(page);
  expect(validation.groupedCorrectly).toBe(true);
  expect(validation.issues.length).toBe(0);
  return validation;
};

/**
 * Assert that parent-child IDs are consistent
 * @param {Object} page - Puppeteer page object
 * @returns {Promise<Object>} - Validation results object
 */
export const assertValidParentChildIDs = async (page) => {
  const validation = await validateParentChildIDs(page);
  expect(validation.valid).toBe(true);
  expect(validation.issues.length).toBe(0);
  return validation;
};

/**
 * Get an element by its data-testid
 * @param {Object} page - Puppeteer page object
 * @param {string} testId - The data-testid value
 * @returns {Promise<ElementHandle>} - The found element
 */
export const getByTestId = async (page, testId) => {
  return page.waitForSelector(`[data-testid="${testId}"]`, { visible: true });
};

/**
 * Click an element by its data-testid
 * @param {Object} page - Puppeteer page object
 * @param {string} testId - The data-testid value
 * @returns {Promise<void>}
 */
export const clickByTestId = async (page, testId) => {
  const element = await getByTestId(page, testId);
  await element.click();
};

/**
 * Add a step to the workflow
 * @param {Object} page - Puppeteer page object
 * @param {string} stepType - The type of step to add (Approval, Upload, Information)
 * @param {string} title - The title for the new step
 * @param {string} role - The role for the new step
 * @returns {Promise<string>} - The ID of the newly created step
 */
export const addStep = async (page, stepType, title, role) => {
  // Click the "Add Step" button
  await clickByTestId(page, 'add-step-button');
  
  // Wait for the form to appear
  await page.waitForSelector('[data-testid="step-form"]', { visible: true });
  
  // Fill out the form
  await page.select('[data-testid="step-type-select"]', stepType);
  await page.type('[data-testid="step-title-input"]', title);
  await page.select('[data-testid="step-role-select"]', role);
  
  // Submit the form
  await clickByTestId(page, 'save-step-button');
  
  // Wait for the form to disappear
  await page.waitForSelector('[data-testid="step-form"]', { hidden: true });
  
  // Get the ID of the newly created step (assuming it's the last one in the list)
  const stepOrder = await getWorkflowStepOrder(page);
  return stepOrder[stepOrder.length - 1];
};

/**
 * Edit a step in the workflow
 * @param {Object} page - Puppeteer page object
 * @param {string} stepId - The ID of the step to edit
 * @param {Object} newValues - The new values for the step
 * @returns {Promise<void>}
 */
export const editStep = async (page, stepId, newValues) => {
  // Click the edit button for the specified step
  await clickByTestId(page, `edit-step-${stepId}-button`);
  
  // Wait for the form to appear
  await page.waitForSelector('[data-testid="step-form"]', { visible: true });
  
  // Update the values
  if (newValues.title) {
    await page.$eval('[data-testid="step-title-input"]', el => el.value = '');
    await page.type('[data-testid="step-title-input"]', newValues.title);
  }
  
  if (newValues.stepType) {
    await page.select('[data-testid="step-type-select"]', newValues.stepType);
  }
  
  if (newValues.role) {
    await page.select('[data-testid="step-role-select"]', newValues.role);
  }
  
  // Submit the form
  await clickByTestId(page, 'save-step-button');
  
  // Wait for the form to disappear
  await page.waitForSelector('[data-testid="step-form"]', { hidden: true });
};

/**
 * Delete a step from the workflow
 * @param {Object} page - Puppeteer page object
 * @param {string} stepId - The ID of the step to delete
 * @returns {Promise<void>}
 */
export const deleteStep = async (page, stepId) => {
  // Click the delete button for the specified step
  await clickByTestId(page, `delete-step-${stepId}-button`);
  
  // Wait for the confirmation dialog to appear
  await page.waitForSelector('[data-testid="confirmation-dialog"]', { visible: true });
  
  // Confirm deletion
  await clickByTestId(page, 'confirm-delete-button');
  
  // Wait for the confirmation dialog to disappear
  await page.waitForSelector('[data-testid="confirmation-dialog"]', { hidden: true });
};

/**
 * Move a step up or down in the workflow
 * @param {Object} page - Puppeteer page object
 * @param {string} stepId - The ID of the step to move
 * @param {string} direction - The direction to move the step ('up' or 'down')
 * @returns {Promise<void>}
 */
export const moveStep = async (page, stepId, direction) => {
  // Click the move button for the specified step
  await clickByTestId(page, `move-${direction}-${stepId}-button`);
  
  // Wait a moment for the UI to update
  await page.waitForTimeout(300);
};

/**
 * Save the current workflow
 * @param {Object} page - Puppeteer page object
 * @returns {Promise<string>} - The workflow JSON as a string
 */
export const saveWorkflow = async (page) => {
  // Click the save button
  await clickByTestId(page, 'save-workflow-button');
  
  // Get the saved workflow JSON from the page
  return page.evaluate(() => {
    return document.querySelector('[data-testid="saved-workflow-json"]').textContent;
  });
};

/**
 * Load a workflow from a JSON string
 * @param {Object} page - Puppeteer page object
 * @param {string|Object} workflowJson - The workflow JSON as a string or object
 * @returns {Promise<void>}
 */
export const loadWorkflow = async (page, workflowJson) => {
  const jsonStr = typeof workflowJson === 'object' ? JSON.stringify(workflowJson) : workflowJson;
  
  // Open the load dialog
  await clickByTestId(page, 'load-workflow-button');
  
  // Wait for the dialog to appear
  await page.waitForSelector('[data-testid="load-workflow-dialog"]', { visible: true });
  
  // Enter the JSON
  await page.type('[data-testid="workflow-json-input"]', jsonStr);
  
  // Click the load button
  await clickByTestId(page, 'confirm-load-button');
  
  // Wait for the dialog to disappear
  await page.waitForSelector('[data-testid="load-workflow-dialog"]', { hidden: true });
  
  // Wait a moment for the workflow to load
  await page.waitForTimeout(500);
};
