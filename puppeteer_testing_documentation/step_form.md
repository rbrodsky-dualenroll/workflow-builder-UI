# Step Form

This document details the step creation and editing form elements and how to interact with them using Puppeteer.

## Base Step Form Fields

| Element | Selector | Description |
|---------|----------|-------------|
| Step Type Select | `[data-testid="step-form-type"]` | Select step type dropdown |
| Workflow Category Select | `[data-testid="field-workflow-category"]` | Select workflow category type |
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

## Workflow Category Select Options

The Workflow Category select dropdown (`[data-testid="field-workflow-category"]`) contains the following options:

| Label | Value | Description |
|-------|-------|-------------|
| "One Time" | `"One Time"` | Steps that only run once for each student (CollegeStudentApplication + registration_one_time) |
| "Per Academic Year" | `"Per Academic Year"` | Steps that run once per academic year (StudentTerm + registration_academic_year) |
| "Per Term" | `"Per Term"` | Steps that run once per term for each student (StudentTerm + registration) |
| "Per Course" | `"Per Course"` | Steps that run for each course registration (StudentDeCourse + registration) |
| "Drop/Withdraw" | `"Drop/Withdraw"` | Steps for dropping or withdrawing from courses (StudentDeCourse + registration_drop_withdraw) |

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

// Select a workflow category (IMPORTANT: Use the exact displayed text value with spaces and proper capitalization)
await page.select('[data-testid="field-workflow-category"]', 'Per Course');  // NOT 'per_course'

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

// Set workflow category to One Time
await page.select('[data-testid="field-workflow-category"]', 'One Time');

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

// Set workflow category
await page.select('[data-testid="field-workflow-category"]', 'One Time');

// Add information content
await page.type('textarea[name="description"]', 'Please review the following information before proceeding.');

// Save the step
await page.click('[data-testid="modal-save-button"]');
```

## Important Notes

1. **Select Option Values**: When using `page.select()`, always use the exact displayed text value with proper spacing and capitalization, not kebab-case or snake_case variants.

2. **Required Fields**: Step Type, Title, Role, and Workflow Category are required fields. The form will not save without these values.

3. **Conditional Sections**: The form has several collapsible sections that are only relevant for certain step types. See other documentation files for details:
   - Feedback Loops: See [feedback_loops.md](./feedback_loops.md)
   - File Uploads: See [file_uploads.md](./file_uploads.md)
   - Conditionals: See [form_sections.md](./form_sections.md)
   - Table Columns: See [form_sections.md](./form_sections.md)
   - CRN Display: See [form_sections.md](./form_sections.md)
