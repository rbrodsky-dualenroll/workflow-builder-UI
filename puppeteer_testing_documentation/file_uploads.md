# File Uploads

This document details the file upload elements in the Workflow Builder application and how to interact with them using Puppeteer.

## File Upload Controls

| Element | Selector | Description |
|---------|----------|-------------|
| File Uploads Section | `[data-testid="file-uploads-section"]` | Container for the file uploads section |
| File Uploads Section Header | `[data-testid="file-uploads-section-header"]` | Header of the file uploads section |
| File Uploads Section Content | `[data-testid="file-uploads-section-content"]` | Content of the file uploads section |
| File Label Input | `[data-testid="file-label-input"]` | Input field for file label |
| File Type Input | `[data-testid="file-type-input"]` | Input field for file type |
| Add File Button | `[data-testid="add-file-button"]` | Button to add a new file upload |
| File Upload List | `[data-testid="file-upload-list"]` | Container for all uploaded files |
| File Upload Item | `[data-testid^="file-upload-item-"]` | A single file upload item |
| Remove File Button | `[data-testid^="remove-file-"][data-action="remove-file"]` | Button to remove a file upload |
| No Files Message | `[data-testid="no-files-message"]` | Message shown when no files are added |

## Working with File Uploads

### Adding File Upload Options to a Document Upload Step

```javascript
// Open Add Step modal
await page.click('[data-testid="add-step-button"]');

// Select Document Upload step type
await page.select('[data-testid="step-form-type"]', 'Document Upload');

// Set step title
await page.type('[data-testid="step-form-title"]', 'Parent Upload MOU Document');

// Set role to Parent
await page.select('[data-testid="field-role"]', 'Parent');

// Set sub-workflow to Once Ever
await page.select('[data-testid="field-workflow-category"]', 'Once Ever');

// Scroll down to see the File Uploads section
await page.evaluate(() => {
  document.querySelector('[data-testid="modal-content"]').scrollTop = 1000;
});

// Add file upload details
await page.type('[data-testid="file-label-input"]', 'MOU Document');
await page.type('[data-testid="file-type-input"]', 'pdf');

// Click Add File button
await page.click('[data-testid="add-file-button"]');

// Verify file was added
await page.waitForSelector('[data-testid^="file-upload-item-"]');

// Add another file upload option
await page.type('[data-testid="file-label-input"]', 'Student ID');
await page.type('[data-testid="file-type-input"]', 'png,jpg,jpeg');
await page.click('[data-testid="add-file-button"]');

// Save the step
await page.click('[data-testid="modal-save-button"]');
```

### Removing a File Upload Option

```javascript
// Edit an existing Document Upload step
const stepId = 'step1'; // Replace with the actual step ID
await page.click(`[data-action="edit-step"][data-for-step="${stepId}"]`);

// Wait for the edit modal to appear
await page.waitForSelector('[data-testid="modal-content"]');

// Scroll down to see the File Uploads section
await page.evaluate(() => {
  document.querySelector('[data-testid="modal-content"]').scrollTop = 1000;
});

// Remove a file upload option
await page.click('[data-testid^="remove-file-"][data-action="remove-file"]');

// Verify file was removed (this checks if there's only one file upload item left)
const fileUploadCount = await page.evaluate(() => {
  return document.querySelectorAll('[data-testid^="file-upload-item-"]').length;
});
console.log('Remaining file upload options:', fileUploadCount);

// Save the step
await page.click('[data-testid="modal-save-button"]');
```

### Modifying File Upload Options

```javascript
// Edit an existing Document Upload step
const stepId = 'step1'; // Replace with the actual step ID
await page.click(`[data-action="edit-step"][data-for-step="${stepId}"]`);

// Wait for the edit modal to appear
await page.waitForSelector('[data-testid="modal-content"]');

// Scroll down to see the File Uploads section
await page.evaluate(() => {
  document.querySelector('[data-testid="modal-content"]').scrollTop = 1000;
});

// Remove all existing file uploads
const removeButtons = await page.$$('[data-testid^="remove-file-"][data-action="remove-file"]');
for (const button of removeButtons) {
  await button.click();
  await page.waitForTimeout(100); // Give the UI time to update
}

// Add new file upload options
await page.type('[data-testid="file-label-input"]', 'Updated Document');
await page.type('[data-testid="file-type-input"]', 'pdf,docx');
await page.click('[data-testid="add-file-button"]');

// Save the step
await page.click('[data-testid="modal-save-button"]');
```

## Important Notes

1. **Required Files**: At least one file upload option is required for Document Upload steps. The form cannot be saved without adding at least one file.

2. **File Types**: File types should be entered as comma-separated extensions without periods (e.g., "pdf,docx,txt").

3. **Scrolling**: The File Uploads section is often below the initial viewport in the modal, so scrolling is necessary to access it.

4. **Verification**: After adding or removing file upload options, it's a good practice to verify that the change took effect by checking the number of file upload items.

5. **Multiple File Types**: To allow multiple file types for a single upload option, enter the extensions as a comma-separated list in the File Type field.
