# Modals

This document details the modal dialogs in the Workflow Builder application and how to interact with them using Puppeteer.

## Generic Modal Elements

| Element | Selector | Description |
|---------|----------|-------------|
| Modal Backdrop | `[data-testid="modal-backdrop"]` | The overlay behind a modal |
| Modal Content | `[data-testid="modal-content"]` | The modal dialog content |
| Modal Close Button | `[data-testid="modal-close-button"]` | Button to close a modal |
| Modal Actions Container | `[data-testid="modal-actions"]` | Container for modal buttons |
| Modal Save Button | `[data-testid="modal-save-button"]` | Button to save changes |
| Modal Cancel Button | `[data-testid="modal-cancel-button"]` | Button to cancel changes |

## Confirmation Dialog

| Element | Selector | Description |
|---------|----------|-------------|
| Confirmation Cancel Button | `[data-testid="confirmation-cancel-button"]` | Button to cancel the confirmation |
| Confirmation Confirm Button | `[data-testid="confirmation-confirm-button"]` | Button to confirm the action |

## Save Workflow Modal

| Element | Selector | Description |
|---------|----------|-------------|
| Workflow Name Input | `[data-testid="workflow-name-input"]` | Input field for the workflow name |
| Save Button | `[data-testid="save-workflow-confirm-button"]` | Button to save the workflow |
| Cancel Button | `[data-testid="save-workflow-cancel-button"]` | Button to cancel saving the workflow |

## Scenario Modal

| Element | Selector | Description |
|---------|----------|-------------|
| Scenario Name Input | `[data-testid="scenario-name-input"]` | Input field for the scenario name |
| Base Scenario Select | `[data-testid="base-scenario-select"]` | Dropdown to select the base scenario |
| Cancel Button | `[data-testid="scenario-modal-cancel-button"]` | Button to cancel scenario creation |
| Create Button | `[data-testid="scenario-modal-create-button"]` | Button to create the scenario |
| Manage Scenarios Modal Close Button | `[data-testid="manage-scenarios-close-button"]` | Button to close the manage scenarios modal |
| Delete Scenario Button | `[data-testid^="delete-scenario-"]` | Button to delete a specific scenario |

## Working with Modals

### Using the Save Workflow Modal

```javascript
// Click the Save Workflow button to open the modal
await page.click('[data-testid="save-workflow-button"]');

// Wait for the modal to appear
await page.waitForSelector('[data-testid="workflow-name-input"]');

// Enter a workflow name
await page.type('[data-testid="workflow-name-input"]', 'My New Workflow');

// Save the workflow
await page.click('[data-testid="save-workflow-confirm-button"]');

// Or cancel saving
// await page.click('[data-testid="save-workflow-cancel-button"]');

// Wait for the modal to close
await page.waitForFunction(() => {
  return document.querySelector('[data-testid="modal-backdrop"]') === null;
});
```

### Scrolling in Modals

For modals with a lot of content, you may need to scroll to access elements that are not visible in the viewport:

```javascript
// Scroll down within a modal to access elements further down
await page.evaluate(() => {
  document.querySelector('[data-testid="modal-content"]').scrollTop = 1000;
});

// Take a screenshot to verify the scroll position
await page.screenshot({ path: 'after-scroll.png' });
```

### Handling Confirmation Dialogs

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

### Closing a Modal

```javascript
// Close a modal using the X button
await page.click('[data-testid="modal-close-button"]');

// Or close using the Cancel button
await page.click('[data-testid="modal-cancel-button"]');

// Verify the modal is closed
const modalClosed = await page.evaluate(() => {
  return document.querySelector('[data-testid="modal-backdrop"]') === null;
});
console.log('Modal closed:', modalClosed);
```

### Saving Changes in a Modal

```javascript
// Make changes in a modal form (see other documentation files for details)
// ...

// Save the changes
await page.click('[data-testid="modal-save-button"]');

// Wait for the modal to close
await page.waitForFunction(() => {
  return document.querySelector('[data-testid="modal-backdrop"]') === null;
});
```

## Tips for Working with Modals

1. **Wait for modals**: Always wait for modal elements to appear before interacting with them
2. **Check modal state**: Verify that modals open and close as expected
3. **Handle overlays**: Be aware that modals may have overlays that can block interactions
4. **Scroll when needed**: Use scrolling to access elements that are not visible
5. **Take screenshots**: Take screenshots to help debug modal interactions
