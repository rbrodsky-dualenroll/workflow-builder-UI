# Feedback Loops

This document details the feedback loop elements in the Workflow Builder application and how to interact with them using Puppeteer.

## Feedback Loop Controls

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

## Working with Feedback Loops

### Adding a Feedback Loop to a Step

```javascript
// First, add a step that will have feedback loops
await page.click('[data-testid="add-step-button"]');
await page.select('[data-testid="step-form-type"]', 'Approval');
await page.type('[data-testid="step-form-title"]', 'College Review');
await page.select('[data-testid="field-role"]', 'College');
await page.select('[data-testid="field-workflow-category"]', 'Per Course');

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

// Save the step
await page.click('[data-testid="modal-save-button"]');
```

### Adding Multiple Feedback Loops

```javascript
// Edit an existing step
const stepId = 'step1'; // Replace with the actual step ID
await page.click(`[data-action="edit-step"][data-for-step="${stepId}"]`);

// Wait for the edit modal to appear
await page.waitForSelector('[data-testid="modal-content"]');

// Open the feedback loops section
await page.click('[data-testid="feedback-loops-section-expander"]');

// Wait for the content to be visible
await page.waitForSelector('[data-testid="feedback-loops-section-content"]');

// Add first feedback loop
await page.select('[data-testid="field-feedback-recipient"]', 'Student');
await page.type('[data-testid="field-nextStep"]', 'Update Submission');
await page.click('[data-testid="add-feedback-loop-button"]');
await page.waitForSelector('[data-testid^="feedback-loop-"]');

// Add second feedback loop
await page.select('[data-testid="field-feedback-recipient"]', 'High School');
await page.type('[data-testid="field-nextStep"]', 'Provide Transcript');
await page.click('[data-testid="add-feedback-loop-button"]');

// Wait for both feedback loops to be added
const feedbackLoopCount = await page.evaluate(() => {
  return document.querySelectorAll('[data-testid^="feedback-loop-"]').length;
});
console.log('Number of feedback loops:', feedbackLoopCount);

// Save the step
await page.click('[data-testid="modal-save-button"]');
```

### Removing a Feedback Loop

```javascript
// Edit an existing step with feedback loops
const stepId = 'step1'; // Replace with the actual step ID
await page.click(`[data-action="edit-step"][data-for-step="${stepId}"]`);

// Wait for the edit modal to appear
await page.waitForSelector('[data-testid="modal-content"]');

// Open the feedback loops section
await page.click('[data-testid="feedback-loops-section-expander"]');

// Wait for the content to be visible
await page.waitForSelector('[data-testid="feedback-loops-section-content"]');

// Remove a feedback loop
await page.click('[data-testid^="remove-feedback-"][data-action="remove-feedback"]');

// Verify the feedback loop was removed
const feedbackLoopCount = await page.evaluate(() => {
  return document.querySelectorAll('[data-testid^="feedback-loop-"]').length;
});
console.log('Remaining feedback loops:', feedbackLoopCount);

// Save the step
await page.click('[data-testid="modal-save-button"]');
```

### Verifying Parent-Child Relationships

After adding feedback loops and saving the step, you can verify that the parent-child relationships are correct:

```javascript
// Verify the parent-child relationship for feedback steps
const verifyFeedbackParentRelationship = async () => {
  return page.evaluate(() => {
    const parentStep = document.querySelector('[data-has-feedback="true"]');
    const parentTitle = parentStep ? parentStep.querySelector('.step-type').textContent.trim() : '';
    
    const feedbackStep = document.querySelector('[data-is-feedback="true"]');
    const feedbackParentLabel = feedbackStep ? 
      feedbackStep.querySelector('.text-gray-500:not(.step-type)').textContent.trim() : '';
    
    // Verify that the parent title is correctly referenced in the feedback step
    const isRelationshipCorrect = feedbackParentLabel.includes(parentTitle);
    
    return {
      parentTitle,
      feedbackParentLabel,
      isRelationshipCorrect
    };
  });
};

const relationshipCheck = await verifyFeedbackParentRelationship();
console.log('Parent step title:', relationshipCheck.parentTitle);
console.log('Feedback step parent label:', relationshipCheck.feedbackParentLabel);
console.log('Relationship is correct:', relationshipCheck.isRelationshipCorrect);
```

## Important Notes About Feedback Loops

1. **Parent-Child Relationship**: Feedback steps are child steps of their parent step. They appear indented below the parent step in the workflow.

2. **Ordering**: When a parent step is moved, all its feedback children move with it. The relative order of feedback steps is maintained.

3. **Visual Indicators**: Parent steps with feedback children have a visual indicator. Feedback steps show their parent step's title.

4. **Data Attributes**: Parent steps have `data-has-feedback="true"`. Feedback steps have `data-is-feedback="true"` and `data-parent-id` set to their parent's ID.

5. **Success Messages**: When adding a feedback loop, a success message appears briefly and then disappears. Wait for this message to confirm the action worked.

6. **Preview**: Always use the preview feature to verify the feedback step before adding it. This helps catch any issues with the step configuration.

7. **Multiple Recipients**: You can create multiple feedback loops for different recipients (Student, High School, College, etc.) from the same parent step.
