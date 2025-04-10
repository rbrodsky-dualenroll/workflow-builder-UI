# Scenario-Specific Overrides

This document details how to test the scenario-specific override functionality in the Workflow Builder application using Puppeteer.

## Overview

When a step from the main workflow is edited in a scenario context, a scenario-specific override of that step is created. This feature allows users to customize steps for specific scenarios without affecting the main workflow.

## UI Elements and Selectors

| Element | Selector | Description |
|---------|----------|-------------|
| Scenario-specific Step | `[data-testid^="workflow-step-"][data-is-scenario-specific="true"]` | Any workflow step that is a scenario-specific override |
| Step with Original ID | `[data-testid^="workflow-step-"][data-original-step-id="originalStepId"]` | Step that references an original main workflow step |
| Scenario Override Badge | `[data-testid="scenario-override-badge"]` | The badge indicating a step is a scenario-specific override |
| Scenario Override Warning (Form) | `[data-testid="scenario-override-warning"]` | Warning shown in the StepForm when editing a main step in a scenario |
| Scenario Override Warning (Modal) | `[data-testid="scenario-override-warning-modal"]` | Warning shown in the StepModal when editing a main step in a scenario |
| Conditional Display | `[data-testid="conditional-display"]` | The conditional logic display section |
| Conditional Display - Single | `[data-testid="conditional-display-single"]` | Conditional display for a single condition |
| Conditional Display - Multiple | `[data-testid="conditional-display-multiple"]` | Conditional display for multiple conditions |
| Condition Name | `[data-testid="conditional-display-condition-name"]` | The name of a condition in the single condition display |
| Specific Condition Item | `[data-testid^="conditional-display-condition-"]` | A specific condition in the multiple conditions list |

## Creating a Scenario-Specific Override

### Detecting Edit of Main Workflow Step in Scenario

```javascript
// First, switch to a scenario
await page.click('[data-testid^="scenario-tab-"]');

// Find a step that exists in the main workflow to edit
const mainStepInScenario = await page.$('[data-is-scenario-specific="false"][data-testid^="workflow-step-"]');
const stepId = await mainStepInScenario.evaluate(el => el.getAttribute('data-step-id'));

// Click the edit button for this step
await page.click(`[data-action="edit-step"][data-for-step="${stepId}"]`);

// Verify the warning message appears
const warningExists = await page.waitForSelector('[data-testid="scenario-override-warning-modal"]', { 
  timeout: 2000,
  visible: true 
});
console.log('Warning displayed:', warningExists !== null);

// Make changes to the step
await page.type('[data-testid="step-form-title"]', ' - Modified for Scenario');

// Save the step
await page.click('[data-testid="modal-save-button"]');

// Wait for changes to be applied
await page.waitForTimeout(500);

// Find the new scenario-specific step (it should have a different ID but reference the original)
const scenarioSpecificStep = await page.$(`[data-original-step-id="${stepId}"]`);
const newStepId = await scenarioSpecificStep.evaluate(el => el.getAttribute('data-step-id'));

console.log('Original step ID:', stepId);
console.log('New scenario-specific step ID:', newStepId);
```

### Verifying the Scenario-Specific Step Properties

```javascript
// Find a scenario-specific step
const scenarioSpecificStep = await page.$('[data-is-scenario-specific="true"]');

// Check that it has the scenario override badge
const hasBadge = await scenarioSpecificStep.$eval('[data-testid="scenario-override-badge"]', el => el.textContent.trim());
console.log('Has override badge:', hasBadge === 'Scenario Override');

// Check that it shows the scenario name
const scenarioName = await scenarioSpecificStep.$eval('[data-testid="scenario-info"]', el => el.textContent.trim());
console.log('Scenario name:', scenarioName);

// Check that it shows conditional logic
const hasConditional = await scenarioSpecificStep.$('[data-testid="conditional-display"]') !== null;
console.log('Has conditional display:', hasConditional);

// Verify visual styling
const hasAmberBorder = await scenarioSpecificStep.evaluate(el => {
  const style = window.getComputedStyle(el);
  return style.borderLeftColor === 'rgb(245, 158, 11)'; // Amber color
});
console.log('Has amber border:', hasAmberBorder);
```

### Testing in Master View

```javascript
// Switch to master view
await page.click('[data-testid="master-view-button"]');

// Find both the original step and the scenario-specific step
const originalStep = await page.$(`[data-step-id="${originalStepId}"]`);
const overrideStep = await page.$(`[data-original-step-id="${originalStepId}"]`);

// Verify both steps are visible in master view
console.log('Original step visible:', originalStep !== null);
console.log('Override step visible:', overrideStep !== null);

// Check that the override step appears after the original step
const originalIndex = await originalStep.evaluate(el => el.getAttribute('data-step-index'));
const overrideIndex = await overrideStep.evaluate(el => el.getAttribute('data-step-index'));
console.log('Override appears after original:', parseInt(overrideIndex) > parseInt(originalIndex));
```

## Important Notes

1. **Step IDs**: When a scenario-specific override is created, it gets a new unique ID but maintains a reference to the original step ID.

2. **Master View**: In the master view, both the original step and any scenario-specific overrides will be visible.

3. **Ordering**: Scenario-specific overrides appear immediately after their original steps in the master view.

4. **Visual Indicators**: Scenario-specific overrides have:
   - An amber left border
   - A "Scenario Override" badge
   - A light amber background
   - A scenario name displayed
   - Conditional logic displayed (using the scenario's condition)

5. **References**: If any other steps in the scenario referenced the original step (like feedback steps), those references will be updated to point to the new scenario-specific step.
