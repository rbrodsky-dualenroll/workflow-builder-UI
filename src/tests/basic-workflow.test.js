/**
 * Basic Workflow Builder Tests
 * 
 * This file contains the most basic tests for the workflow builder.
 * It demonstrates how to use the test helpers to interact with the application.
 */

import {
  initializeWorkflowBuilder,
  assertStepOrder,
  assertValidFeedbackRelationships,
  assertValidParentChildIDs,
  addStep,
  editStep,
  deleteStep,
  moveStep
} from './test-helpers.js';

describe('Workflow Builder', () => {
  beforeEach(async () => {
    // Initialize the app with default test workflow for each test
    await initializeWorkflowBuilder(page);
  });
  
  test('should display workflow steps in the correct order', async () => {
    // Verify the initial step order
    await assertStepOrder(page, ['step1', 'step2', 'feedback1_step', 'feedback2_step', 'step3']);
    
    // Take a screenshot to verify the workflow display
    await page.screenshot({ path: 'screenshots/workflow-display.png' });
  });
  
  test('should maintain valid feedback relationships', async () => {
    // Verify feedback relationships are valid
    const validation = await assertValidFeedbackRelationships(page);
    
    // Additional checks on the validation result
    expect(validation.feedbackStepsCount).toBe(2);
    expect(validation.parentsWithFeedback).toBe(1);
  });
  
  test('should maintain valid parent-child IDs', async () => {
    // Verify parent-child IDs are valid
    const validation = await assertValidParentChildIDs(page);
    
    // Additional checks on the validation result
    expect(validation.stats.totalFeedbackSteps).toBe(2);
    expect(validation.stats.uniqueParents).toBe(1);
    expect(Object.keys(validation.parentMap)).toContain('step2');
  });
  
  test('should add a new step', async () => {
    // Add a new step
    const newStepId = await addStep(page, 'Information', 'New Test Step', 'Student');
    
    // Verify the step was added to the end of the workflow
    const expectedOrder = ['step1', 'step2', 'feedback1_step', 'feedback2_step', 'step3', newStepId];
    await assertStepOrder(page, expectedOrder);
    
    // Take a screenshot after adding the step
    await page.screenshot({ path: 'screenshots/add-step.png' });
  });
  
  test('should edit a step', async () => {
    // Edit the first step
    await editStep(page, 'step1', { 
      title: 'Edited Step 1', 
      role: 'College' 
    });
    
    // Verify the step was edited (check the DOM for the updated title)
    const stepTitle = await page.$eval('[data-testid="workflow-step-step1"] [data-testid="step-title"]', 
      el => el.textContent);
    expect(stepTitle).toContain('Edited Step 1');
    
    // Verify the step role was updated
    const stepRole = await page.$eval('[data-testid="workflow-step-step1"] [data-testid="step-role"]', 
      el => el.textContent);
    expect(stepRole).toContain('College');
    
    // Take a screenshot after editing the step
    await page.screenshot({ path: 'screenshots/edit-step.png' });
  });
  
  test('should delete a step', async () => {
    // Delete the last regular step (step3)
    await deleteStep(page, 'step3');
    
    // Verify the step was removed
    const expectedOrder = ['step1', 'step2', 'feedback1_step', 'feedback2_step'];
    await assertStepOrder(page, expectedOrder);
    
    // Take a screenshot after deleting the step
    await page.screenshot({ path: 'screenshots/delete-step.png' });
  });
  
  test('should move a step down', async () => {
    // Move the first step down
    await moveStep(page, 'step1', 'down');
    
    // Verify the step order changed correctly
    // Note: The parent-feedback relationships should be maintained,
    // so step1 should move to after step2 AND its feedback steps
    const expectedOrder = ['step2', 'feedback1_step', 'feedback2_step', 'step1', 'step3'];
    await assertStepOrder(page, expectedOrder);
    
    // Take a screenshot after moving the step
    await page.screenshot({ path: 'screenshots/move-step-down.png' });
  });
  
  test('should move a step up', async () => {
    // Move the last step up
    await moveStep(page, 'step3', 'up');
    
    // Verify the step order changed correctly
    // Note: The parent-feedback relationships should be maintained,
    // so step3 should move to before step2 to avoid breaking the parent-feedback group
    const expectedOrder = ['step1', 'step3', 'step2', 'feedback1_step', 'feedback2_step'];
    await assertStepOrder(page, expectedOrder);
    
    // Take a screenshot after moving the step
    await page.screenshot({ path: 'screenshots/move-step-up.png' });
  });
});
