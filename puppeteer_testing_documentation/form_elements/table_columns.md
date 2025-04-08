# Table Columns Section

This document details the table columns configuration form section in the Workflow Builder application and how to interact with it using Puppeteer.

## Table Columns Elements

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
| New Column Input | `[data-testid="new-column-input"]` | Input field for new column name |
| Add Column Button | `[data-testid="add-column-button"]` | Button to add a new column |

## Common Column Templates

The column templates are predefined sets of common columns that can be added to a table. Each template has its own data-testid attribute.

| Template | Selector | Description |
|----------|----------|-------------|
| Standard Columns | `[data-testid="add-common-column-standard"]` | Common standard columns (ID, Name, etc.) |
| Student Info | `[data-testid="add-common-column-student"]` | Student information columns |
| Course Info | `[data-testid="add-common-column-course"]` | Course information columns |
| Instructor Info | `[data-testid="add-common-column-instructor"]` | Instructor information columns |
| High School Info | `[data-testid="add-common-column-highschool"]` | High school information columns |
| Registration Info | `[data-testid="add-common-column-registration"]` | Registration information columns |
| Timestamp Info | `[data-testid="add-common-column-timestamp"]` | Timestamp information columns |
| Status Info | `[data-testid="add-common-column-status"]` | Status information columns |

## Working with Table Columns

### Adding a Custom Column

```javascript
// Open the table columns section
await page.click('[data-testid="table-columns-section-expander"]');

// Wait for the content to be visible
await page.waitForSelector('[data-testid="table-columns-section-content"]');

// Add a new custom column
await page.type('[data-testid="new-column-input"]', 'Custom Column Name');
await page.click('[data-testid="add-column-button"]');

// Verify the column was added
await page.waitForSelector('[data-testid^="table-column-"]');
```

### Adding Common Columns from Templates

```javascript
// Open the table columns section
await page.click('[data-testid="table-columns-section-expander"]');

// Wait for the content to be visible
await page.waitForSelector('[data-testid="table-columns-section-content"]');

// Toggle template options (if they're not already visible)
await page.click('[data-testid="toggle-templates-button"]');

// Wait for the templates list to be visible
await page.waitForSelector('[data-testid="column-templates-list"]');

// Add standard columns
await page.click('[data-testid="add-common-column-standard"]');

// Add student info columns
await page.click('[data-testid="add-common-column-student"]');

// Verify columns were added
await page.waitForSelector('[data-testid^="table-column-"]');
```

### Removing a Column

```javascript
// Open the table columns section
await page.click('[data-testid="table-columns-section-expander"]');

// Wait for the content to be visible
await page.waitForSelector('[data-testid="table-columns-section-content"]');

// Get all remove column buttons
const removeButtons = await page.$$('[data-testid^="remove-column-"]');

// Click the first remove button (if it exists)
if (removeButtons.length > 0) {
  await removeButtons[0].click();
}

// Alternative: Remove a specific column by its name
// First, find the column by name
const columnName = 'Custom Column Name';
const columnElement = await page.evaluate((name) => {
  const columns = Array.from(document.querySelectorAll('[data-testid^="table-column-"]'));
  const targetColumn = columns.find(col => col.textContent.includes(name));
  return targetColumn ? targetColumn.getAttribute('data-testid') : null;
}, columnName);

// If found, click its remove button
if (columnElement) {
  const removeButtonId = columnElement.replace('table-column-', 'remove-column-');
  await page.click(`[data-testid="${removeButtonId}"]`);
}
```

### Getting All Current Column Names

```javascript
// Get the names of all current columns
const columnNames = await page.evaluate(() => {
  const columns = Array.from(document.querySelectorAll('[data-testid^="table-column-"]'));
  return columns.map(col => {
    // Extract the column name from the text content
    // This might need adjustment based on the actual DOM structure
    return col.textContent.trim();
  });
});

console.log('Current columns:', columnNames);
```

## Tips for Working with Table Columns

1. **Column Order**: Columns are displayed in the order they are added. If order is important, add them in the desired sequence.

2. **Unique Names**: Ensure column names are unique. Duplicate names may cause issues with selection and identification.

3. **Visibility**: Always expand the table columns section before attempting to interact with its contents.

4. **Template Toggling**: The column templates section may be collapsed by default. Use the toggle button to expand it if needed.

5. **Validation**: After adding or removing columns, verify that the changes took effect by checking the number of column elements or their names.

6. **Wait Times**: Some operations may require a brief wait time for the UI to update. Use `page.waitForSelector()` or `page.waitForTimeout()` if needed.
