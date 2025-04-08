# Main UI Elements

This document details the main UI elements of the Workflow Builder application and how to interact with them using Puppeteer.

## Top Level Controls

| Element | Selector | Description |
|---------|----------|-------------|
| Add Step Button | `[data-testid="add-step-button"]` | Button to add a new step |
| Import Workflow Button | `[data-testid="import-workflow-button"]` | Button to import a workflow |
| Save Workflow Button | `[data-testid="save-workflow-button"]` | Button to save the workflow |
| New Workflow Button | `[data-testid="new-workflow-button"]` | Button to create a new workflow |
| Workflow Steps Container | `[data-testid="workflow-steps-container"]` | Container for all workflow steps |
| Empty Workflow Message | `[data-testid="empty-workflow"]` | Message shown when no steps exist |

## Workflow Management Examples

### Creating a New Workflow

```javascript
// Click the New Workflow button
await page.click('[data-testid="new-workflow-button"]');

// Confirm the workflow steps container is empty
const isEmpty = await page.evaluate(() => {
  return document.querySelector('[data-testid="empty-workflow"]') !== null;
});
console.log('Workflow is empty:', isEmpty);
```

### Importing a Workflow

```javascript
// Click the Import Workflow button
await page.click('[data-testid="import-workflow-button"]');

// Wait for the file input to be available and upload a file
const [fileChooser] = await Promise.all([
  page.waitForFileChooser(),
  page.click('[data-testid="import-workflow-button"]')
]);

await fileChooser.accept(['path/to/workflow.json']);

// Wait for the workflow to be loaded
await page.waitForSelector('[data-testid^="workflow-step-"]');
```

### Saving a Workflow

```javascript
// Click the Save Workflow button
await page.click('[data-testid="save-workflow-button"]');

// If there's a download dialog, handle it by setting a custom download path
// This needs to be done before clicking the Save button
const downloadPath = '/path/to/downloads';
await page._client.send('Page.setDownloadBehavior', {
  behavior: 'allow',
  downloadPath: downloadPath
});
```

### Adding a Step to the Workflow

```javascript
// Click the Add Step button
await page.click('[data-testid="add-step-button"]');

// Wait for the modal to appear
await page.waitForSelector('[data-testid="modal-content"]');

// Fill in the step details (see step_form.md for more details)
await page.select('[data-testid="step-form-type"]', 'Approval');
await page.type('[data-testid="step-form-title"]', 'Sample Step');
await page.select('[data-testid="field-role"]', 'College');

// Save the step
await page.click('[data-testid="modal-save-button"]');

// Verify the step was added
await page.waitForSelector('[data-testid^="workflow-step-"]');
```

## Page Navigation and Setup

Before running any tests, make sure to navigate to the application URL:

```javascript
// Navigate to the Workflow Builder application
await page.goto('http://localhost:5173');

// Wait for the page to load completely
await page.waitForSelector('[data-testid="add-step-button"]');
```

## Testing Tips

- Always wait for elements to be visible and interactable before clicking on them
- If you're having issues with elements not being found, check the browser console for errors
- Take screenshots at key points to help debug issues visually
- Use page.evaluate() to run JavaScript in the page context for complex verifications
