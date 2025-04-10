# Workflow Steps

This document details the workflow steps elements and how to interact with them using Puppeteer.

## Step Elements

| Element | Selector | Description |
|---------|----------|-------------|
| Any Workflow Step | `[data-testid^="workflow-step-"]` | Any workflow step element |
| Step by ID | `[data-step-id="step1"]` | Step with specific ID |
| Step by Role | `[data-step-role="College"]` | Step with specific role |
| Scenario-Specific Step | `[data-is-scenario-specific="true"]` | Step that is a scenario-specific override |
| Step with Original Reference | `[data-original-step-id="stepId"]` | Step that references an original main workflow step |
| Parent Steps | `[data-is-feedback="false"]` | All non-feedback steps |
| Feedback Steps | `[data-is-feedback="true"]` | All feedback child steps |
| Parent Steps with Feedback | `[data-has-feedback="true"]` | Parent steps that have feedback children |
| Feedback Steps for Parent | `[data-parent-id="parentId"]` | All feedback steps for a specific parent |
| Drag Handle | `[data-drag-handle="true"]` | Element that can be dragged |
| Step Header | `[data-testid^="step-header-"]` | Header part of a step |

## Step Controls

| Element | Selector | Description |
|---------|----------|-------------|
| Toggle Preview Button | `[data-action="toggle-preview"][data-for-step="stepId"]` | Button to expand/collapse a step |
| Edit Step Button | `[data-action="edit-step"][data-for-step="stepId"]` | Button to edit a step |
| Delete Step Button | `[data-action="delete-step"][data-for-step="stepId"]` | Button to delete a step |

## Working with Steps

### Checking Workflow Step Order

```javascript
// Get the current order of workflow steps
const getStepOrder = async () => {
  return page.evaluate(() => {
    const steps = document.querySelectorAll('[data-testid^="workflow-step-"]');
    return Array.from(steps).map(step => ({
      id: step.getAttribute('data-step-id'),
      index: step.getAttribute('data-step-index'),
      isFeedback: step.getAttribute('data-is-feedback') === 'true',
      parentId: step.getAttribute('data-parent-id') || null
    }));
  });
};

const stepOrder = await getStepOrder();
console.log('Current step order:', stepOrder);
```

### Dragging a Step

```javascript
// Drag a parent step to a new position
const dragStep = async (sourceId, targetId, placeAfter = true) => {
  // Get the source and target elements
  const sourceStep = await page.$(`[data-step-id="${sourceId}"]`);
  const targetStep = await page.$(`[data-step-id="${targetId}"]`);
  
  if (!sourceStep || !targetStep) {
    throw new Error('Source or target step not found');
  }
  
  // Get bounding boxes to calculate coordinates
  const sourceBounds = await sourceStep.boundingBox();
  const targetBounds = await targetStep.boundingBox();
  
  // Calculate drag points
  const sourceX = sourceBounds.x + sourceBounds.width / 2;
  const sourceY = sourceBounds.y + sourceBounds.height / 2;
  
  const targetX = targetBounds.x + targetBounds.width / 2;
  const targetY = placeAfter ? 
    targetBounds.y + targetBounds.height + 5 : 
    targetBounds.y - 5;
  
  // Perform the drag operation
  await page.mouse.move(sourceX, sourceY);
  await page.mouse.down();
  await page.mouse.move(targetX, targetY, { steps: 10 }); // Move in small steps for smoother drag
  await page.mouse.up();
  
  // Allow time for the UI to update
  await page.waitForTimeout(500);
};

// Example: Drag step2 after step3
await dragStep('step2', 'step3', true);
```

### Editing a Step

```javascript
// Find the step by ID and click its edit button
const stepId = 'step1'; // Replace with the actual step ID
await page.click(`[data-action="edit-step"][data-for-step="${stepId}"]`);

// Wait for the edit modal to appear
await page.waitForSelector('[data-testid="modal-content"]');

// Make changes to the step (see step_form.md for details)
await page.type('[data-testid="step-form-title"]', 'Updated Step Title');

// Save the changes
await page.click('[data-testid="modal-save-button"]');
```

### Deleting a Step

```javascript
// Find the step by ID and click its delete button
const stepId = 'step1'; // Replace with the actual step ID
await page.click(`[data-action="delete-step"][data-for-step="${stepId}"]`);

// Wait for the confirmation dialog
await page.waitForSelector('[data-testid="confirmation-confirm-button"]');

// Confirm the deletion
await page.click('[data-testid="confirmation-confirm-button"]');

// Verify the step was removed
const stepExists = await page.evaluate((id) => {
  return document.querySelector(`[data-step-id="${id}"]`) !== null;
}, stepId);

console.log('Step still exists:', stepExists); // Should be false
```

### Validating Feedback Step Grouping

```javascript
// Validate that feedback steps are properly grouped with their parents
const validateFeedbackGrouping = async () => {
  return page.evaluate(() => {
    const steps = Array.from(document.querySelectorAll('[data-testid^="workflow-step-"]'));
    const stepOrder = steps.map(step => ({
      id: step.getAttribute('data-step-id'),
      isFeedback: step.getAttribute('data-is-feedback') === 'true',
      parentId: step.getAttribute('data-parent-id') || null,
      index: parseInt(step.getAttribute('data-step-index') || '0', 10)
    }));
    
    // Check if feedback steps come immediately after their parents
    let isValid = true;
    const issues = [];
    
    // Group steps by parent ID for feedback steps
    const feedbackStepsByParent = {};
    stepOrder.forEach(step => {
      if (step.isFeedback && step.parentId) {
        if (!feedbackStepsByParent[step.parentId]) {
          feedbackStepsByParent[step.parentId] = [];
        }
        feedbackStepsByParent[step.parentId].push(step);
      }
    });
    
    // Check each parent's feedback children
    Object.entries(feedbackStepsByParent).forEach(([parentId, feedbackSteps]) => {
      const parentIndex = stepOrder.findIndex(step => step.id === parentId);
      if (parentIndex === -1) {
        isValid = false;
        issues.push(`Parent step ${parentId} not found for feedback steps`);
        return;
      }
      
      // Check if all feedback steps are consecutive after the parent
      feedbackSteps.forEach((step, i) => {
        const expectedIndex = parentIndex + 1 + i;
        const actualIndex = stepOrder.findIndex(s => s.id === step.id);
        if (actualIndex !== expectedIndex) {
          isValid = false;
          issues.push(`Feedback step ${step.id} is not in correct position after parent ${parentId}`);
        }
      });
    });
    
    return { isValid, issues, stepOrder };
  });
};

const validationResult = await validateFeedbackGrouping();
console.log('Validation result:', validationResult);
```

## Important Notes

When working with drag and drop operations:

1. The parent step and all its feedback children should move together
2. The relative order of feedback steps should be maintained
3. Feedback steps cannot be dragged independently
