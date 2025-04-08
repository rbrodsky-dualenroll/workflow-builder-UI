# Form Sections

This document details the collapsible form sections in the Workflow Builder application and how to interact with them using Puppeteer.

## Conditionals Section

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

## Table Columns Section

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

## CRN Display Section

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

## Working with Form Sections

### Conditionals Section

```javascript
// Open the conditionals section
await page.click('[data-testid="conditionals-section-expander"]');

// Wait for the content to be visible
await page.waitForSelector('[data-testid="conditionals-section-content"]');

// Click the add condition button
await page.click('[data-testid="add-condition-button"]');

// Wait for the condition dialog to appear
// ... (condition dialog interactions would go here)

// Toggle a specific condition checkbox
await page.click('[data-testid="condition-checkbox-some_condition_id"]');
```

### Table Columns Section

```javascript
// Open the table columns section
await page.click('[data-testid="table-columns-section-expander"]');

// Wait for the content to be visible
await page.waitForSelector('[data-testid="table-columns-section-content"]');

// Add a new table column
await page.type('[data-testid="new-column-input"]', 'Custom Column');
await page.click('[data-testid="add-column-button"]');

// Verify the column was added
await page.waitForSelector('[data-testid^="table-column-"]');

// Toggle template options
await page.click('[data-testid="toggle-templates-button"]');

// Add a common column
await page.click('[data-testid="add-common-column-standard"]');

// Remove a column
await page.click('[data-testid^="remove-column-"]');
```

### CRN Display Section

```javascript
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

## Tips for Working with Form Sections

1. **Wait for Content**: Always wait for section content to be visible after expanding a section
2. **Check Visibility**: Verify that content is visible before interacting with elements
3. **Scroll if Needed**: Some sections may be off-screen and require scrolling
4. **Verify Changes**: Confirm that changes take effect by checking for new elements
5. **Use Screenshots**: Take screenshots to debug visibility issues with sections
