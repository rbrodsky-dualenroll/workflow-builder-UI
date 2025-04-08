# Step Form

This document details the step creation and editing form elements and how to interact with them using Puppeteer.

## Base Step Form Fields

| Element | Selector | Description |
|---------|----------|-------------|
| Step Type Select | `[data-testid="step-form-type"]` | Select step type dropdown |
| Sub-workflow Select | `[data-testid="field-subworkflow"]` | Select sub-workflow type |
| Step Title Input | `[data-testid="step-form-title"]` | Input field for step title |
| Role Select | `[data-testid="field-role"]` | Select role dropdown |
| Description Input | `textarea[name="description"]` | Textarea for step description (no data-testid) |

## Role Select Options

The Role select dropdown (`[data-testid="field-role"]`) contains the following options:

| Label | Value | Description |
|-------|-------|-------------|
| "College" | `"College"` | Role for college staff or administrators |
| "High School" | `"High School"` | Role for high school staff or counselors |
| "Student" | `"Student"` | Role for students |
| "Parent" | `"Parent"` | Role for parents or guardians |
| "Approver" | `"Approver"` | Role for general approval authority |
| "Dean" | `"Dean"` | Role for academic deans |
| "System" | `"System"` | Role for automated system operations |

## Sub-workflow Select Options

The Sub-workflow select dropdown (`[data-testid="field-subworkflow"]`) contains the following options:

| Label | Value | Description |
|-------|-------|-------------|
| "Once Ever" | `"Once Ever"` | Step occurs only once for a student |
| "Per Year" | `"Per Year"` | Step occurs once per academic year |
| "Per Term" | `"Per Term"` | Step occurs once per academic term |
| "Per Course" | `"Per Course"` | Step occurs for each course registration |

## Working with the Step Form

### Creating a Basic Approval Step

```javascript
// Open Add Step modal
await page.click('[data-testid="add-step-button"]');

// Wait for the modal to appear
await page.waitForSelector('[data-testid="modal-content"]');

// Select a step type (IMPORTANT: Use the exact displayed text value with spaces and proper capitalization)
await page.select('[data-testid="step-form-type"]', 'Approval');

// Set the step title
await page.type('[data-testid="step-form-title"]', 'High School Approval');

// Select a role (IMPORTANT: Use the exact displayed text value with spaces and proper capitalization)
await page.select('[data-testid="field-role"]', 'High School');  // NOT 'high_school'

// Select a subworkflow (IMPORTANT: Use the exact displayed text value with spaces and proper capitalization)
await page.select('[data-testid="field-subworkflow"]', 'Per Course');  // NOT 'per_course'

// Add a description
await page.type('textarea[name="description"]', 'This step requires approval from a high school counselor.');

// Save the step
await page.click('[data-testid="modal-save-button"]');

// Wait for the modal to close
await page.waitForFunction(() => {
  return document.querySelector('[data-testid="modal-backdrop"]') === null;
});
```

### Creating a Document Upload Step

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
await page.select('[data-testid="field-subworkflow"]', 'Once Ever');

// See file_uploads.md for details on configuring file upload options
// ...

// Save the step
await page.click('[data-testid="modal-save-button"]');
```

### Creating an Information Step

```javascript
// Open Add Step modal
await page.click('[data-testid="add-step-button"]');

// Select Information step type
await page.select('[data-testid="step-form-type"]', 'Information');

// Set step title
await page.type('[data-testid="step-form-title"]', 'Course Registration Information');

// Set role (typically System for information steps)
await page.select('[data-testid="field-role"]', 'System');

// Set sub-workflow
await page.select('[data-testid="field-subworkflow"]', 'Once Ever');

// Add information content
await page.type('textarea[name="description"]', 'Please review the following information before proceeding.');

// Save the step
await page.click('[data-testid="modal-save-button"]');
```

## Important Notes

1. **Select Option Values**: When using `page.select()`, always use the exact displayed text value with proper spacing and capitalization, not kebab-case or snake_case variants.

2. **Required Fields**: Step Type, Title, Role, and Sub-workflow are required fields. The form will not save without these values.

3. **Conditional Sections**: The form has several collapsible sections that are only relevant for certain step types. See other documentation files for details:
   - Feedback Loops: See [feedback_loops.md](./feedback_loops.md)
   - File Uploads: See [file_uploads.md](./file_uploads.md)
   - Conditionals: See [form_sections.md](./form_sections.md)
   - Table Columns: See [form_sections.md](./form_sections.md)
   - CRN Display: See [form_sections.md](./form_sections.md)
