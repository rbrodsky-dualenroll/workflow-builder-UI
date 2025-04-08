# Scenarios

This document details the scenario management features of the Workflow Builder application and how to interact with them using Puppeteer.

## Scenario System Elements

| Element | Selector | Description |
|---------|----------|-------------|
| New Scenario Button | `[data-testid="new-scenario-button"]` | Button to create a new scenario |
| Manage Scenarios Button | `[data-testid="manage-scenarios-button"]` | Button to open scenario management modal |
| Master View Button | `[data-testid="master-view-button"]` | Button to toggle master view |
| Scenario Tab | `[data-testid^="scenario-tab-"]` | Tab for a specific scenario |
| Main Scenario Tab | `[data-testid="scenario-tab-main"]` | Tab for the main scenario |
| Scenario Condition Badge | `[data-testid^="scenario-condition-badge-"]` | Badge showing the scenario condition |

## Scenario Modal Elements

| Element | Selector | Description |
|---------|----------|-------------|
| Scenario Name Input | `[data-testid="scenario-name-input"]` | Input field for the scenario name |
| Base Scenario Select | `[data-testid="base-scenario-select"]` | Dropdown to select the base scenario |
| Cancel Button | `[data-testid="scenario-modal-cancel-button"]` | Button to cancel scenario creation |
| Create Button | `[data-testid="scenario-modal-create-button"]` | Button to create the scenario |
| Scenario Conditions Section | `[data-testid="scenario-conditions-section"]` | Container for scenario conditions |
| Scenario Conditions Section Header | `[data-testid="scenario-conditions-section-header"]` | Header of the scenario conditions section |
| Scenario Conditions Section Expander | `[data-testid="scenario-conditions-section-expander"]` | Button to expand/collapse the scenario conditions section |
| Scenario Conditions List | `[data-testid="scenario-conditions-list"]` | List of available scenario conditions |
| Scenario Condition Item | `[data-testid^="scenario-condition-item-"]` | A specific condition item in the list |
| Scenario Condition Radio | `[data-testid^="scenario-condition-radio-"]` | Radio button to select a condition |
| Scenario Condition Radio for Specific Condition | `[data-testid="scenario-condition-radio-{conditionName}"]` | Radio button for a specific named condition |
| No Scenario Conditions Message | `[data-testid="no-scenario-conditions-message"]` | Message shown when no conditions are available |
| Add Scenario Condition Button | `[data-testid="add-scenario-condition-button"]` | Button to add a new condition |

## Scenario Condition Form Elements

| Element | Selector | Description |
|---------|----------|-------------|
| Condition Name Input | `[data-testid="scenario-condition-name-input"]` | Input field for the condition name |
| Entity Select | `[data-testid="scenario-condition-entity-select"]` | Dropdown to select the entity type |
| Property Select | `[data-testid="scenario-condition-property-select"]` | Dropdown to select the entity property |
| Custom Property Input | `[data-testid="scenario-condition-custom-property-input"]` | Input field for custom property name when "Custom property..." is selected |
| Comparison Select | `[data-testid="scenario-condition-comparison-select"]` | Dropdown to select the comparison operator |
| Value Input | `[data-testid="scenario-condition-value-input"]` | Input field for the condition value |
| Save Condition Button | `[data-testid="scenario-condition-save-button"]` | Button to save the condition |
| Cancel Condition Button | `[data-testid="scenario-condition-cancel-button"]` | Button to cancel condition creation |

### Entity Select Options

The Entity dropdown (`[data-testid="scenario-condition-entity-select"]`) contains these options:

| Label | Value | Selector |
|-------|-------|----------|
| "-- Select an entity --" | "" | `[data-testid="entity-option-empty"]` |
| "Course" | "Course" | `[data-testid="entity-option-course"]` |
| "Student" | "Student" | `[data-testid="entity-option-student"]` |
| "High School" | "HighSchool" | `[data-testid="entity-option-highschool"]` |
| "Instructor" | "Instructor" | `[data-testid="entity-option-instructor"]` |

### Property Select Options by Entity

Properties available depend on the selected entity:

#### Course Properties

| Label | Value | Selector |
|-------|-------|----------|
| "-- Select entity first --" | "" | `[data-testid="property-option-empty"]` |
| "Subject" | "subject" | `[data-testid="property-option-course-subject"]` |
| "Department" | "department" | `[data-testid="property-option-course-department"]` |
| "Course Number" | "courseNumber" | `[data-testid="property-option-course-number"]` |
| "Title" | "title" | `[data-testid="property-option-course-title"]` |
| "Category" | "category" | `[data-testid="property-option-course-category"]` |
| "Custom property..." | "custom" | `[data-testid="property-option-course-custom"]` |

#### Student Properties

| Label | Value | Selector |
|-------|-------|----------|
| "-- Select entity first --" | "" | `[data-testid="property-option-empty"]` |
| "Grade Level" | "gradeLevel" | `[data-testid="property-option-student-gradelevel"]` |
| "Age" | "age" | `[data-testid="property-option-student-age"]` |
| "Program" | "program" | `[data-testid="property-option-student-program"]` |
| "High School" | "highSchool" | `[data-testid="property-option-student-highschool"]` |
| "GPA" | "gpa" | `[data-testid="property-option-student-gpa"]` |
| "Custom property..." | "custom" | `[data-testid="property-option-student-custom"]` |

#### High School Properties

| Label | Value | Selector |
|-------|-------|----------|
| "-- Select entity first --" | "" | `[data-testid="property-option-empty"]` |
| "Name" | "name" | `[data-testid="property-option-highschool-name"]` |
| "Type" | "type" | `[data-testid="property-option-highschool-type"]` |
| "District" | "district" | `[data-testid="property-option-highschool-district"]` |
| "Custom property..." | "custom" | `[data-testid="property-option-highschool-custom"]` |

#### Instructor Properties

| Label | Value | Selector |
|-------|-------|----------|
| "-- Select entity first --" | "" | `[data-testid="property-option-empty"]` |
| "Name" | "name" | `[data-testid="property-option-instructor-name"]` |
| "Department" | "department" | `[data-testid="property-option-instructor-department"]` |
| "High School" | "highSchool" | `[data-testid="property-option-instructor-highschool"]` |
| "Years of Experience" | "experience" | `[data-testid="property-option-instructor-experience"]` |
| "Custom property..." | "custom" | `[data-testid="property-option-instructor-custom"]` |

### Comparison Select Options

The Comparison dropdown (`[data-testid="scenario-condition-comparison-select"]`) contains these options:

| Label | Value | Selector |
|-------|-------|----------|
| "-- Select a comparison --" | "" | `[data-testid="comparison-option-empty"]` |
| "equals" | "equals" | `[data-testid="comparison-option-equals"]` |
| "does not equal" | "not-equals" | `[data-testid="comparison-option-not-equals"]` |
| "contains" | "contains" | `[data-testid="comparison-option-contains"]` |
| "does not contain" | "not-contains" | `[data-testid="comparison-option-not-contains"]` |
| "starts with" | "starts-with" | `[data-testid="comparison-option-starts-with"]` |
| "ends with" | "ends-with" | `[data-testid="comparison-option-ends-with"]` |
| "greater than" | "gt" | `[data-testid="comparison-option-gt"]` |
| "less than" | "lt" | `[data-testid="comparison-option-lt"]` |
| "greater than or equal to" | "gte" | `[data-testid="comparison-option-gte"]` |
| "less than or equal to" | "lte" | `[data-testid="comparison-option-lte"]` |

## Manage Scenarios Modal Elements

| Element | Selector | Description |
|---------|----------|-------------|
| Manage Scenarios Modal Close Button | `[data-testid="manage-scenarios-close-button"]` | Button to close the manage scenarios modal |
| Delete Scenario Button | `[data-testid^="delete-scenario-"]` | Button to delete a specific scenario |

## Recommended Elements (Not Yet Implemented)

| Element | Recommended Selector | Description |
|---------|----------|-------------|
| Named Scenario Tab | `[data-testid="scenario-tab-{scenarioId}"]` | Tab for a specific scenario with consistent ID pattern |
| Edit Scenario Button | `[data-testid="edit-scenario-{scenarioId}"]` | Button to edit an existing scenario |
| Edit Scenario Modal | `[data-testid="edit-scenario-modal"]` | Modal for editing scenario properties |
| Scenario Condition List Item | `[data-testid="scenario-condition-{conditionId}"]` | List item for a specific condition |
| Edit Condition Button | `[data-testid="edit-condition-{conditionId}"]` | Button to edit a specific condition |
| Delete Condition Button | `[data-testid="delete-condition-{conditionId}"]` | Button to delete a specific condition |

## Working with Scenarios

### Creating a New Scenario

```javascript
// Click the New Scenario button
await page.click('[data-testid="new-scenario-button"]');

// Wait for the scenario modal to appear
await page.waitForSelector('[data-testid="scenario-name-input"]');

// Fill in the scenario name
await page.type('[data-testid="scenario-name-input"]', 'Homeschool Students');

// Select the base scenario
await page.select('[data-testid="base-scenario-select"]', 'main');

// Expand the scenario conditions section (IMPORTANT: Use this selector for the expander)
await page.click('[data-testid="scenario-conditions-section-expander"]');

// Wait for the conditions content to be visible
await page.waitForTimeout(500);

// Add a new condition
await page.click('[data-testid="add-scenario-condition-button"]');

// Fill in the condition name
await page.type('[data-testid="scenario-condition-name-input"]', 'homeschool_student');

// Select entity type 
await page.select('[data-testid="scenario-condition-entity-select"]', 'Student');
// Note: Use the exact value from the "Value" column in the Entity Options table

// Select property
await page.select('[data-testid="scenario-condition-property-select"]', 'highSchool');
// Note: Use the exact value from the "Value" column in the Property Options table

// Select comparison
await page.select('[data-testid="scenario-condition-comparison-select"]', 'equals');
// Note: Use the exact value from the "Value" column in the Comparison Options table

// Enter value
await page.type('[data-testid="scenario-condition-value-input"]', 'Homeschool');

// Save the condition
await page.click('[data-testid="scenario-condition-save-button"]');

// After adding and saving the condition, select it by its specific testid
await page.click('[data-testid="scenario-condition-radio-homeschool_student"]');

// Create the scenario
await page.click('[data-testid="scenario-modal-create-button"]');

// Wait for the scenario tab to appear
await page.waitForSelector('[data-testid^="scenario-tab-"]');
```

### Switching Between Scenarios

```javascript
// Click on a specific scenario tab
await page.click('[data-testid="scenario-tab-main"]');

// Or click on a specific scenario tab by ID
// Note: This pattern assumes consistent ID usage for scenario tabs
const scenarioId = 'scenario_1234';
await page.click(`[data-testid="scenario-tab-${scenarioId}"]`);

// Toggle Master View
await page.click('[data-testid="master-view-button"]');
```

### Managing Scenarios

```javascript
// Open the Manage Scenarios modal
await page.click('[data-testid="manage-scenarios-button"]');

// Wait for the modal to appear
await page.waitForSelector('[data-testid^="delete-scenario-"]');

// Delete a specific scenario
const scenarioId = 'scenario_1234';
await page.click(`[data-testid="delete-scenario-${scenarioId}"]`);

// Confirm the deletion in the confirmation dialog
await page.waitForSelector('[data-testid="confirmation-confirm-button"]');
await page.click('[data-testid="confirmation-confirm-button"]');

// Close the manage scenarios modal using the Close button
await page.click('[data-testid="manage-scenarios-close-button"]');
```

### Creating a Welding Courses Condition Example

```javascript
// Click the New Scenario button
await page.click('[data-testid="new-scenario-button"]');

// Fill in the scenario name
await page.type('[data-testid="scenario-name-input"]', 'Welding Courses');

// Expand the scenario conditions section
await page.click('[data-testid="scenario-conditions-section-expander"]');

// Add a new condition
await page.click('[data-testid="add-scenario-condition-button"]');

// Fill in the condition name
await page.type('[data-testid="scenario-condition-name-input"]', 'welding_course');

// Select entity type (Course)
await page.select('[data-testid="scenario-condition-entity-select"]', 'Course');

// Select property (Department)
await page.select('[data-testid="scenario-condition-property-select"]', 'department');

// Select comparison (equals)
await page.select('[data-testid="scenario-condition-comparison-select"]', 'equals');

// Enter value
await page.type('[data-testid="scenario-condition-value-input"]', 'Welding');

// Save the condition
await page.click('[data-testid="scenario-condition-save-button"]');

// Select the condition
await page.click('[data-testid="scenario-condition-radio-welding_course"]');

// Create the scenario
await page.click('[data-testid="scenario-modal-create-button"]');
```

## Tips for Working with Scenarios

1. **Master View**: Use the Master View to see the complete workflow with all scenario-specific steps.
2. **Consistent IDs**: Recommend consistent ID patterns for scenario tabs to make testing easier.
3. **Condition Validation**: When creating conditions, verify that they appear in the condition list.
4. **Wait for UI Updates**: Always wait for UI updates after changing scenarios or creating new ones.
5. **Screenshot Verification**: Take screenshots to verify scenario tabs and condition badges.
6. **Dropdown Values**: Always use the exact values from the tables above when selecting options from dropdowns.
