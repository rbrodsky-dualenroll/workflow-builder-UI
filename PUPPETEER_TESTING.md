# Workflow Builder - Puppeteer Testing Guide

This document provides a comprehensive reference for using Puppeteer to test the Workflow Builder application. All components have been updated with consistent data attributes to make testing more reliable and maintainable.

## Key Data Attributes

All major components have been enhanced with the following types of data attributes:

- `data-testid`: Unique identifiers for elements, often combining the element type and an ID
- `data-action`: The action a button or control performs
- `data-for-step`: Which step a control is associated with
- `data-step-id`: The unique ID of a workflow step
- `data-is-feedback`: Whether a step is a feedback step (true/false)
- `data-has-feedback`: Whether a step has feedback children (true/false)
- `data-parent-id`: For feedback steps, the ID of their parent step

## Main UI Elements

| Element | Selector | Description |
|---------|----------|-------------|
| Add Step Button | `[data-testid="add-step-button"]` | Button to add a new step |
| Import Workflow Button | `[data-testid="import-workflow-button"]` | Button to import a workflow |
| Save Workflow Button | `[data-testid="save-workflow-button"]` | Button to save the workflow |
| New Workflow Button | `[data-testid="new-workflow-button"]` | Button to create a new workflow |
| Workflow Steps Container | `[data-testid="workflow-steps-container"]` | Container for all workflow steps |
| Empty Workflow Message | `[data-testid="empty-workflow"]` | Message shown when no steps exist |
## Scenario System

| Element | Selector | Description |
|---------|----------|-------------|
| New Scenario Button | `[data-testid="new-scenario-button"]` | Button to create a new scenario |
| Manage Scenarios Button | `[data-testid="manage-scenarios-button"]` | Button to open scenario management modal |
| Master View Button | `[data-testid="master-view-button"]` | Button to toggle master view |
| Scenario Tab | `[data-testid^="scenario-tab-"]` | Tab for a specific scenario |
| Main Scenario Tab | `[data-testid="scenario-tab-main"]` | Tab for the main scenario |
| Scenario Condition Badge | `[data-testid^="scenario-condition-badge-"]` | Badge showing the scenario condition |

## Scenario Modal

| Element | Selector | Description |
|---------|----------|-------------|
| Scenario Name Input | `[data-testid="scenario-name-input"]` | Input field for the scenario name |
| Base Scenario Select | `[data-testid="base-scenario-select"]` | Dropdown to select the base scenario |
| Cancel Button | `[data-testid="scenario-modal-cancel-button"]` | Button to cancel scenario creation |
| Create Button | `[data-testid="scenario-modal-create-button"]` | Button to create the scenario |
| Scenario Conditions Section | `[data-testid="scenario-conditions-section"]` | Container for scenario conditions |
| Scenario Conditions List | `[data-testid="scenario-conditions-list"]` | List of available scenario conditions |
| Scenario Condition Item | `[data-testid^="scenario-condition-item-"]` | A specific condition item in the list |
| Scenario Condition Radio | `[data-testid^="scenario-condition-radio-"]` | Radio button to select a condition |
| Add Scenario Condition Button | `[data-testid="add-scenario-condition-button"]` | Button to add a new condition |

## Workflow Steps

| Element | Selector | Description |
|---------|----------|-------------|
| Any Workflow Step | `[data-testid^="workflow-step-"]` | Any workflow step element |
| Step by ID | `[data-step-id="step1"]` | Step with specific ID |
| Step by Role | `[data-step-role="College"]` | Step with specific role |
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

## Modals

| Element | Selector | Description |
|---------|----------|-------------|
| Modal Backdrop | `[data-testid="modal-backdrop"]` | The overlay behind a modal |
| Modal Content | `[data-testid="modal-content"]` | The modal dialog content |
| Modal Close Button | `[data-testid="modal-close-button"]` | Button to close a modal |

## Scenario Modal

| Element | Selector | Description |
|---------|----------|-------------|
| Scenario Name Input | `[data-testid="scenario-name-input"]` | Input field for the scenario name |
| Base Scenario Select | `[data-testid="base-scenario-select"]` | Dropdown to select the base scenario |
| Cancel Button | `[data-testid="scenario-modal-cancel-button"]` | Button to cancel scenario creation |
| Create Button | `[data-testid="scenario-modal-create-button"]` | Button to create the scenario |

## Puppeteer Testing Examples

### 1. Opening the Add Step Modal

```javascript
// Click the Add Step button
await page.click('[data-testid="add-step-button"]');

// Wait for the modal to appear
await page.waitForSelector('[data-testid="modal-content"]');
```

### 2. Checking Workflow Step Order

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

### 3. Dragging a Step

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

### 4. Validating Feedback Step Grouping

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

### 5. Working with Scenarios

```javascript
// Click the New Scenario button
await page.click('[data-testid="new-scenario-button"]');

// Wait for the scenario modal to appear
await page.waitForSelector('[data-testid="scenario-name-input"]');

// Fill in the scenario name
await page.type('[data-testid="scenario-name-input"]', 'Homeschool Students');

// Select the base scenario
await page.select('[data-testid="base-scenario-select"]', 'main');

// Create the scenario
await page.click('[data-testid="scenario-modal-create-button"]');

// Wait for the scenario tab to appear
await page.waitForSelector('[data-testid^="scenario-tab-"]');

// Click on a specific scenario tab
await page.click('[data-testid="scenario-tab-main"]');

// Toggle Master View
await page.click('[data-testid="master-view-button"]');

// Open the Manage Scenarios modal
await page.click('[data-testid="manage-scenarios-button"]');

// Wait for the modal to appear
await page.waitForSelector('[data-testid^="delete-scenario-"]');

// Delete a specific scenario
await page.click('[data-testid="delete-scenario-scenario_1234"]');

// Confirm the deletion in the confirmation dialog
await page.waitForSelector('[data-testid="confirmation-confirm-button"]');
await page.click('[data-testid="confirmation-confirm-button"]');

// Alternatively, you could cancel the deletion using
// await page.click('[data-testid="confirmation-cancel-button"]');

// Close the manage scenarios modal using the Close button
await page.click('[data-testid="manage-scenarios-close-button"]');

// Alternatively, you could close the modal using the X button
// await page.click('[data-testid="modal-close-button"]');
```

### 6. Working with Role and Subworkflow Fields

```javascript
// Open Add Step modal
await page.click('[data-testid="add-step-button"]');

// Select a role
await page.select('[data-testid="field-role"]', 'high_school');

// Select a subworkflow
await page.select('[data-testid="field-subworkflow"]', 'per_course');
```

### 7. Working with Confirmation Dialogs

```javascript
// Example of handling a confirmation dialog, such as when deleting a scenario

// First trigger an action that will show a confirmation dialog
await page.click('[data-testid^="delete-scenario-"]');

// Wait for the confirmation dialog to appear
await page.waitForSelector('[data-testid="confirmation-confirm-button"]');

// Take a screenshot of the confirmation dialog
await page.screenshot({ path: 'confirmation-dialog.png' });

// To confirm the action
await page.click('[data-testid="confirmation-confirm-button"]');

// Or to cancel the action
// await page.click('[data-testid="confirmation-cancel-button"]');
```

### 8. Creating a Test Workflow with Parent and Feedback Steps

```javascript
// Example function to create a test workflow with feedback steps
const createTestWorkflow = async () => {
  // Add a parent step
  await page.click('[data-testid="add-step-button"]');
  await page.waitForSelector('[data-testid="modal-content"]');
  
  // Fill in step details
  await page.type('[data-testid="field-title"]', 'Parent Step');
  await page.select('[data-testid="field-stepType"]', 'approval');
  await page.select('[data-testid="field-role"]', 'college');
  
  // Submit the form
  await page.click('[data-testid="modal-save-button"]');
  
  // Wait for the step to be added
  await page.waitForSelector('[data-testid^="workflow-step-"]');
  
  // Get the ID of the newly created step
  const parentId = await page.evaluate(() => {
    const step = document.querySelector('[data-testid^="workflow-step-"]');
    return step ? step.getAttribute('data-step-id') : null;
  });
  
  if (!parentId) {
    throw new Error('Failed to get parent step ID');
  }
  
  // Now add a feedback step (implementation depends on your UI flow)
  // This is just a placeholder - you'll need to customize based on your application
  await page.click(`[data-action="edit-step"][data-for-step="${parentId}"]`);
  await page.waitForSelector('[data-testid="feedback-loops-section-header"]');
  await page.click('[data-testid="feedback-loops-section-header"]');
  
  // After the feedback section opens, fill in the details
  await page.select('[data-testid="feedback-recipient-select"]', 'Student');
  await page.type('[data-testid="feedback-step-name-input"]', 'Feedback Step');
  await page.click('[data-testid="add-feedback-loop-button"]');
  
  // Save the form
  await page.click('[data-testid="modal-save-button"]');
  
  return { parentId };
};

// Create the test workflow
const { parentId } = await createTestWorkflow();
```

## Best Practices for Puppeteer Testing

1. **Use data attributes**: Always use data attributes (not CSS selectors) for selecting elements
2. **Wait for elements**: Always wait for elements to appear before interacting with them
3. **Validate step properties**: Check data attributes to validate step properties
4. **Use proper timeouts**: Allow time for animations and UI updates
5. **Test with real scenarios**: Test common user flows like adding, editing, and moving steps

## Troubleshooting

If tests are failing, check:

1. **Element visibility**: Is the element visible and not covered by another element?
2. **Element state**: Is the element in the expected state (enabled, disabled)?
3. **Timing issues**: Are you waiting long enough for operations to complete?
4. **Browser console**: Check for JavaScript errors in the browser console
5. **Screenshots**: Take screenshots at key points to debug visual issues
6. **Scrolling issues**: Elements might be outside the viewport, especially in modals

### Scrolling in Modals

To scroll within a modal dialog to access elements that are outside the viewport:

```javascript
// Scroll down within a modal
await page.evaluate(() => {
  document.querySelector('[data-testid="modal-content"]').scrollTop = 1000;
});

// Take a screenshot to verify the scroll position
await page.screenshot({ path: 'after-scroll.png' });
```

This approach is particularly useful for accessing sections like feedback loops that may be at the bottom of a form.

## Additional Notes

When testing drag and drop operations, be aware that:

1. The parent step and all its feedback children should move together
2. The relative order of feedback steps should be maintained
3. Feedback steps cannot be dragged independently

## Testing Feedback Steps

When testing feedback steps, verify these specific aspects:

1. **Parent-Child Relationship**: The feedback step should properly display the parent step title
2. **Visual Styling**: The feedback step should have appropriate indentation and styling
3. **Data Attributes**: All data attributes should be consistent and accurate

```javascript
// After adding a feedback loop and saving, verify the parent-child relationship
const parentTitle = await page.evaluate(() => {
  const parentStep = document.querySelector('[data-has-feedback="true"]');
  return parentStep ? parentStep.querySelector('.step-type').textContent.trim() : '';
});

const feedbackParentLabel = await page.evaluate(() => {
  const feedbackStep = document.querySelector('[data-is-feedback="true"]');
  return feedbackStep ? 
    feedbackStep.querySelector('.text-gray-500:not(.step-type)').textContent.trim() : '';
});

// Verify that the parent title is correctly referenced in the feedback step
console.log('Parent step title:', parentTitle);
console.log('Feedback step parent label:', feedbackParentLabel);
console.log('Relationship is correct:', feedbackParentLabel.includes(parentTitle));
```

## Collapsible Form Sections

### Conditionals Section

| Element | Selector | Description |
|---------|----------|-------------|
| Conditionals Section | `[data-testid="conditionals-section"]` | Container for the conditionals section |
| Conditionals Section Header | `[data-testid="conditionals-section-header"]` | Header of the conditionals section |
| Conditionals Section Expander | `[data-testid="conditionals-section-expander"]` | Button to expand/collapse the conditionals section |
| Conditionals Section Content | `[data-testid="conditionals-section-content"]` | Content of the conditionals section (when expanded) |
| Scenario Info | `[data-testid="scenario-info"]` | Information about conditional scenario |
| Conditionals Intro | `[data-testid="conditionals-intro"]` | Introduction text for conditionals |
| Workflow Conditions List | `[data-testid="workflow-conditions-list"]` | Container for all workflow conditions |
| Condition Item | `[data-testid^="condition-item-"]` | A single condition item |
| Condition Checkbox | `[data-testid^="condition-checkbox-"]` | Checkbox to toggle a condition |
| No Conditions Message | `[data-testid="no-conditions-message"]` | Message shown when no conditions exist |
| Add Condition Button | `[data-testid="add-condition-button"]` | Button to add a new condition |

### Table Columns Section

| Element | Selector | Description |
|---------|----------|-------------|
| Table Columns Section | `[data-testid="table-columns-section"]` | Container for the table columns section |
| Table Columns Section Header | `[data-testid="table-columns-section-header"]` | Header of the table columns section |
| Table Columns Section Expander | `[data-testid="table-columns-section-expander"]` | Button to expand/collapse the table columns section |
| Table Columns Section Content | `[data-testid="table-columns-section-content"]` | Content of the table columns section (when expanded) |
| Table Columns Intro | `[data-testid="table-columns-intro"]` | Introduction text for table columns |
| Existing Table Columns | `[data-testid="existing-table-columns"]` | Container for all existing table columns |
| Table Column Item | `[data-testid^="table-column-"]` | A single table column item |
| Remove Column Button | `[data-testid^="remove-column-"]` | Button to remove a table column |
| Column Templates Section | `[data-testid="column-templates-section"]` | Section for common column templates |
| Toggle Templates Button | `[data-testid="toggle-templates-button"]` | Button to toggle column templates |
| Column Templates List | `[data-testid="column-templates-list"]` | List of common column templates |
| Add Common Column Button | `[data-testid^="add-common-column-"]` | Button to add a common column |
| Add Column Form | `[data-testid="add-column-form"]` | Form to add a new column |
| New Column Input | `[data-testid="new-column-input"]` | Input for new column name |
| Add Column Button | `[data-testid="add-column-button"]` | Button to add a new column |

### CRN Display Section

| Element | Selector | Description |
|---------|----------|-------------|
| CRN Display Section | `[data-testid="crn-display-section"]` | Container for the CRN display section |
| CRN Display Section Header | `[data-testid="crn-display-section-header"]` | Header of the CRN display section |
| CRN Display Section Expander | `[data-testid="crn-display-section-expander"]` | Button to expand/collapse the CRN display section |
| CRN Display Section Content | `[data-testid="crn-display-section-content"]` | Content of the CRN display section (when expanded) |
| CRN Display Intro | `[data-testid="crn-display-intro"]` | Introduction section for CRN display |
| Show CRN Info Checkbox | `[data-testid="show-crn-info-checkbox"]` | Checkbox to toggle CRN information |
| CRN Display Options | `[data-testid="crn-display-options"]` | Container for CRN display options |
| CRN Display Options Intro | `[data-testid="crn-display-options-intro"]` | Introduction text for CRN display options |
| CRN Display Fields | `[data-testid="crn-display-fields"]` | Container for all CRN display fields |
| CRN Field Item | `[data-testid^="crn-field-"]` | A single CRN field item |
| CRN Field Checkbox | `[data-testid^="crn-field-checkbox-"]` | Checkbox to toggle a CRN field |
| CRN Display Info | `[data-testid="crn-display-info"]` | Information about CRN display |

### Testing Collapsible Sections Example

```javascript
// Open the conditionals section
await page.click('[data-testid="conditionals-section-expander"]');

// Wait for the content to be visible
await page.waitForSelector('[data-testid="conditionals-section-content"]');

// Click the add condition button
await page.click('[data-testid="add-condition-button"]');

// Open the table columns section
await page.click('[data-testid="table-columns-section-expander"]');

// Wait for the content to be visible
await page.waitForSelector('[data-testid="table-columns-section-content"]');

// Add a new table column
await page.type('[data-testid="new-column-input"]', 'Custom Column');
await page.click('[data-testid="add-column-button"]');

// Verify the column was added
await page.waitForSelector('[data-testid^="table-column-"]');

// Open the CRN Display section
await page.click('[data-testid="crn-display-section-expander"]');

// Wait for the content to be visible
await page.waitForSelector('[data-testid="crn-display-section-content"]');

// Toggle the Show CRN Info checkbox
await page.click('[data-testid="show-crn-info-checkbox"]');

// Wait for the options to appear
await page.waitForSelector('[data-testid="crn-display-options"]');

// Select a CRN field
await page.click('[data-testid="crn-field-checkbox-time"]');
```

## Feedback Loops and Step Form Testing

### Modal Controls
| Element | Selector | Description |
|---------|----------|-------------|
| Modal Actions Container | `[data-testid="modal-actions"]` | Container for modal buttons |
| Modal Save Button | `[data-testid="modal-save-button"]` | Button to save the step |
| Modal Cancel Button | `[data-testid="modal-cancel-button"]` | Button to cancel step creation/editing |

### Manage Scenarios Modal

| Element | Selector | Description |
|---------|----------|-------------|
| Manage Scenarios Modal Close Button | `[data-testid="manage-scenarios-close-button"]` | Button to close the manage scenarios modal |
| Delete Scenario Button | `[data-testid^="delete-scenario-"]` | Button to delete a specific scenario |
| Confirmation Cancel Button | `[data-testid="confirmation-cancel-button"]` | Button to cancel deletion in confirmation dialog |
| Confirmation Confirm Button | `[data-testid="confirmation-confirm-button"]` | Button to confirm deletion in confirmation dialog |
| Modal Close Button | `[data-testid="modal-close-button"]` | X button to close any modal dialog |

## Base Step Form Fields
| Element | Selector | Description |
|---------|----------|-------------|
| Step Type Select | `[data-testid="field-stepType"]` | Select step type dropdown |
| Sub-workflow Select | `[data-testid="field-subworkflow"]` | Select sub-workflow type |
| Step Title Input | `[data-testid="field-title"]` | Input for step title |
| Role Select | `[data-testid="field-role"]` | Select role dropdown |
| Description Input | `textarea[name="description"]` | Textarea for step description (no data-testid) |

### Feedback Loop Controls

| Element | Selector | Description |
|---------|----------|-------------|
| Feedback Loops Section | `[data-testid="feedback-loops-section"]` | Container for the feedback loops section |
| Feedback Loops Header | `[data-testid="feedback-loops-section-header"]` | Header of the feedback loops section |
| Feedback Loops Expander | `[data-testid="feedback-loops-section-expander"]` | Button to expand/collapse the feedback loops section |
| Feedback Loops Content | `[data-testid="feedback-loops-section-content"]` | Content of the feedback loops section (when expanded) |
| Feedback Loops Info | `[data-testid="feedback-loops-info"]` | Informational text about feedback loops |
| Feedback Diagram | `[data-testid="feedback-diagram"]` | Visual diagram showing how feedback loops work |
| Feedback Success Message | `[data-testid="feedback-success-message"]` | Success message shown after adding a feedback loop |
| Existing Feedback Loops | `[data-testid="existing-feedback-loops"]` | Container for all existing feedback loops |
| Individual Feedback Loop | `[data-testid^="feedback-loop-"]` | A single feedback loop item |
| Remove Feedback Button | `[data-testid^="remove-feedback-"][data-action="remove-feedback"]` | Button to remove a feedback loop |
| Add Feedback Form | `[data-testid="add-feedback-form"]` | Form for adding a new feedback loop |
| Add Feedback Heading | `[data-testid="add-feedback-heading"]` | Heading for the add feedback form |
| Recipient Field | `[data-testid="field-feedback-recipient"]` | Dropdown for selecting the feedback recipient |
| Next Step Field | `[data-testid="field-nextStep"]` | Input for specifying the next step name |
| Toggle Preview Button | `[data-testid="toggle-feedback-preview-button"]` | Button to toggle preview of the feedback step |
| Feedback Preview | `[data-testid="feedback-preview"]` | Preview of the feedback step that will be created |
| Add Feedback Loop Button | `[data-testid="add-feedback-loop-button"][data-action="add-feedback-loop"]` | Button to add a new feedback loop |

### Testing Feedback Loops Example

```javascript
// Open the feedback loops section
await page.click('[data-testid="feedback-loops-section-expander"]');

// Wait for the content to be visible
await page.waitForSelector('[data-testid="feedback-loops-section-content"]');

// Select a recipient
await page.select('[data-testid="field-feedback-recipient"]', 'Student');

// Fill in the next step name
await page.type('[data-testid="field-nextStep"]', 'Request Additional Documentation');

// Preview the feedback step before adding
await page.click('[data-testid="toggle-feedback-preview-button"]');

// Wait for the preview to appear
await page.waitForSelector('[data-testid="feedback-preview"]');

// Take a screenshot of the preview for verification
await page.screenshot({ path: 'feedback-preview.png' });

// Add the feedback loop
await page.click('[data-testid="add-feedback-loop-button"]');

// Wait for the success message to appear
await page.waitForSelector('[data-testid="feedback-success-message"]');

// Wait for the feedback loop to be added
await page.waitForSelector('[data-testid^="feedback-loop-"]');

// Verify the feedback loop was added correctly
const feedbackText = await page.evaluate(() => {
  const element = document.querySelector('[data-testid^="feedback-loop-"]');
  return element ? element.textContent : null;
});

console.log('Feedback loop text:', feedbackText);

// Wait for success message to disappear (auto-dismisses after 3 seconds)
await page.waitForTimeout(3100);
const successMessageGone = await page.evaluate(() => {
  return !document.querySelector('[data-testid="feedback-success-message"]');
});
console.log('Success message disappeared:', successMessageGone);

// Remove the feedback loop
await page.click('[data-testid^="remove-feedback-"][data-action="remove-feedback"]');

// Verify the feedback loop was removed
const hasNoFeedbackLoops = await page.evaluate(() => {
  return document.querySelectorAll('[data-testid^="feedback-loop-"]').length === 0;
});

console.log('All feedback loops removed:', hasNoFeedbackLoops);
```
