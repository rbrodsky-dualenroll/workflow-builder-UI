# CRN Display Section

This document details the CRN (Course Registration Number) display configuration form section in the Workflow Builder application and how to interact with it using Puppeteer.

## CRN Display Elements

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

## CRN Field Options

The following CRN fields can be enabled or disabled using their respective checkboxes:

| Field | Selector | Description |
|-------|----------|-------------|
| Course Number | `[data-testid="crn-field-checkbox-course-number"]` | Display course number |
| Course Title | `[data-testid="crn-field-checkbox-course-title"]` | Display course title |
| Section Number | `[data-testid="crn-field-checkbox-section-number"]` | Display section number |
| Instructor | `[data-testid="crn-field-checkbox-instructor"]` | Display instructor name |
| Location | `[data-testid="crn-field-checkbox-location"]` | Display course location |
| Time | `[data-testid="crn-field-checkbox-time"]` | Display course meeting time |
| Days | `[data-testid="crn-field-checkbox-days"]` | Display course meeting days |
| Credits | `[data-testid="crn-field-checkbox-credits"]` | Display course credits |
| Fees | `[data-testid="crn-field-checkbox-fees"]` | Display course fees |
| Required Materials | `[data-testid="crn-field-checkbox-materials"]` | Display required materials |
| Capacity | `[data-testid="crn-field-checkbox-capacity"]` | Display course capacity |
| Enrollment | `[data-testid="crn-field-checkbox-enrollment"]` | Display current enrollment |
| Waitlist | `[data-testid="crn-field-checkbox-waitlist"]` | Display waitlist information |
| Department | `[data-testid="crn-field-checkbox-department"]` | Display department |
| Prerequisite | `[data-testid="crn-field-checkbox-prerequisite"]` | Display prerequisite information |
| Start/End Dates | `[data-testid="crn-field-checkbox-dates"]` | Display course start and end dates |
| Campus | `[data-testid="crn-field-checkbox-campus"]` | Display campus location |
| Notes | `[data-testid="crn-field-checkbox-notes"]` | Display course notes |

## Working with CRN Display Settings

### Enabling CRN Display

```javascript
// Open the CRN Display section
await page.click('[data-testid="crn-display-section-expander"]');

// Wait for the content to be visible
await page.waitForSelector('[data-testid="crn-display-section-content"]');

// Enable CRN info display (if not already enabled)
const isChecked = await page.evaluate(() => {
  const checkbox = document.querySelector('[data-testid="show-crn-info-checkbox"]');
  return checkbox ? checkbox.checked : false;
});

if (!isChecked) {
  await page.click('[data-testid="show-crn-info-checkbox"]');
}

// Wait for the options to appear
await page.waitForSelector('[data-testid="crn-display-options"]');
```

### Selecting Specific Fields to Display

```javascript
// Open the CRN Display section and enable CRN info (see previous example)

// Select specific fields to display
const fieldsToEnable = [
  'course-number',
  'course-title',
  'instructor',
  'time',
  'days',
  'credits'
];

// Enable each field
for (const field of fieldsToEnable) {
  const selector = `[data-testid="crn-field-checkbox-${field}"]`;
  
  // Check if the field exists
  const fieldExists = await page.evaluate((sel) => {
    return !!document.querySelector(sel);
  }, selector);
  
  if (fieldExists) {
    // Check if it's already enabled
    const isChecked = await page.evaluate((sel) => {
      const checkbox = document.querySelector(sel);
      return checkbox ? checkbox.checked : false;
    }, selector);
    
    // Toggle if needed
    if (!isChecked) {
      await page.click(selector);
    }
  }
}
```

### Disabling All CRN Fields

```javascript
// Open the CRN Display section
await page.click('[data-testid="crn-display-section-expander"]');

// Wait for the content to be visible
await page.waitForSelector('[data-testid="crn-display-section-content"]');

// Disable CRN info display (if currently enabled)
const isChecked = await page.evaluate(() => {
  const checkbox = document.querySelector('[data-testid="show-crn-info-checkbox"]');
  return checkbox ? checkbox.checked : false;
});

if (isChecked) {
  await page.click('[data-testid="show-crn-info-checkbox"]');
}
```

### Getting Currently Selected Fields

```javascript
// Get the list of currently enabled CRN fields
const enabledFields = await page.evaluate(() => {
  const checkboxes = Array.from(document.querySelectorAll('[data-testid^="crn-field-checkbox-"]'));
  return checkboxes
    .filter(checkbox => checkbox.checked)
    .map(checkbox => {
      // Extract the field name from the data-testid attribute
      const testId = checkbox.getAttribute('data-testid');
      return testId.replace('crn-field-checkbox-', '');
    });
});

console.log('Enabled CRN fields:', enabledFields);
```

## Tips for Working with CRN Display Settings

1. **Main Toggle**: The "Show CRN Info" checkbox acts as a master toggle. When disabled, all CRN fields are hidden regardless of their individual settings.

2. **Visibility Dependencies**: The CRN field options are only visible when the "Show CRN Info" checkbox is enabled. Always check this checkbox first.

3. **Default Settings**: Some fields may be enabled by default. Check the current state of checkboxes before interacting with them.

4. **Performance**: Enabling too many fields may impact the performance of the application. Use only the fields that are necessary.

5. **Field Relationships**: Some fields may have dependencies on others. For example, enabling "Time" might automatically enable related fields like "Days".

6. **Waiting for UI Updates**: Allow sufficient time for the UI to update after toggling checkboxes. Use `page.waitForTimeout(100)` if needed.

7. **Verification**: Always verify that changes have been applied by checking the state of checkboxes after interactions.
