# Conditional Form Elements

This document details the conditional form elements used in both step forms and scenario forms in the Workflow Builder application.

## Types of Conditional Forms

The Workflow Builder has two distinct conditional forms:
1. **Step Conditions** - Used in step forms to control when a step should be shown
2. **Scenario Conditions** - Used in scenario creation to determine when a scenario is active

Both forms share similar structures but have distinct selectors and usage patterns.

## Step Conditionals Section

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

## Step Condition Form Elements

| Element | Selector | Description |
|---------|----------|-------------|
| Condition Name Input | `[data-testid="step-condition-name-input"]` | Input field for the condition name |
| Entity Select | `[data-testid="step-condition-entity-select"]` | Dropdown to select the entity type |
| Property Select | `[data-testid="step-condition-property-select"]` | Dropdown to select the entity property |
| Custom Property Input | `[data-testid="step-condition-custom-property-input"]` | Input field for custom property name when "Custom property..." is selected |
| Comparison Select | `[data-testid="step-condition-comparison-select"]` | Dropdown to select the comparison operator |
| Value Input | `[data-testid="step-condition-value-input"]` | Input field for the condition value |
| Save Condition Button | `[data-testid="step-condition-save-button"]` | Button to save the condition |
| Cancel Condition Button | `[data-testid="step-condition-cancel-button"]` | Button to cancel condition creation |

## Scenario Condition Form Elements

| Element | Selector | Description |
|---------|----------|-------------|
| Scenario Conditions Section | `[data-testid="scenario-conditions-section"]` | Container for scenario conditions |
| Scenario Conditions Section Header | `[data-testid="scenario-conditions-section-header"]` | Header of the scenario conditions section |
| Scenario Conditions Section Expander | `[data-testid="scenario-conditions-section-expander"]` | Button to expand/collapse the scenario conditions section |
| Scenario Conditions List | `[data-testid="scenario-conditions-list"]` | List of available scenario conditions |
| Scenario Condition Item | `[data-testid^="scenario-condition-item-"]` | A specific condition item in the list |
| Scenario Condition Radio | `[data-testid^="scenario-condition-radio-"]` | Radio button to select a condition |
| Scenario Condition Radio for Specific Condition | `[data-testid="scenario-condition-radio-{conditionName}"]` | Radio button for a specific named condition |
| No Scenario Conditions Message | `[data-testid="no-scenario-conditions-message"]` | Message shown when no conditions are available |
| Add Scenario Condition Button | `[data-testid="add-scenario-condition-button"]` | Button to add a new condition |
| Condition Name Input | `[data-testid="scenario-condition-name-input"]` | Input field for the condition name |
| Entity Select | `[data-testid="scenario-condition-entity-select"]` | Dropdown to select the entity type |
| Property Select | `[data-testid="scenario-condition-property-select"]` | Dropdown to select the entity property |
| Custom Property Input | `[data-testid="scenario-condition-custom-property-input"]` | Input field for custom property name when "Custom property..." is selected |
| Comparison Select | `[data-testid="scenario-condition-comparison-select"]` | Dropdown to select the comparison operator |
| Value Input | `[data-testid="scenario-condition-value-input"]` | Input field for the condition value |
| Save Condition Button | `[data-testid="scenario-condition-save-button"]` | Button to save the condition |
| Cancel Condition Button | `[data-testid="scenario-condition-cancel-button"]` | Button to cancel condition creation |

## Entity Select Options

The Entity dropdown (`[data-testid="step-condition-entity-select"]` and `[data-testid="scenario-condition-entity-select"]`) contains these options:

| Label | Value | Selector |
|-------|-------|----------|
| "-- Select an entity --" | "" | `[data-testid="entity-option-empty"]` |
| "Course" | "Course" | `[data-testid="entity-option-course"]` |
| "Student" | "Student" | `[data-testid="entity-option-student"]` |
| "High School" | "HighSchool" | `[data-testid="entity-option-highschool"]` |
| "Instructor" | "Instructor" | `[data-testid="entity-option-instructor"]` |
| "Step" | "Step" | `[data-testid="entity-option-step"]` (Step conditions only) |

## Property Select Options by Entity

Properties available depend on the selected entity:

### Course Properties

| Label | Value | Selector |
|-------|-------|----------|
| "-- Select entity first --" | "" | `[data-testid="property-option-empty"]` |
| "Subject" | "subject" | `[data-testid="property-option-course-subject"]` |
| "Department" | "department" | `[data-testid="property-option-course-department"]` |
| "Course Number" | "courseNumber" | `[data-testid="property-option-course-number"]` |
| "Title" | "title" | `[data-testid="property-option-course-title"]` |
| "Category" | "category" | `[data-testid="property-option-course-category"]` |
| "Custom property..." | "custom" | `[data-testid="property-option-course-custom"]` |

### Student Properties

| Label | Value | Selector |
|-------|-------|----------|
| "-- Select entity first --" | "" | `[data-testid="property-option-empty"]` |
| "Grade Level" | "gradeLevel" | `[data-testid="property-option-student-gradelevel"]` |
| "Age" | "age" | `[data-testid="property-option-student-age"]` |
| "Program" | "program" | `[data-testid="property-option-student-program"]` |
| "High School" | "highSchool" | `[data-testid="property-option-student-highschool"]` |
| "GPA" | "gpa" | `[data-testid="property-option-student-gpa"]` |
| "Custom property..." | "custom" | `[data-testid="property-option-student-custom"]` |

### High School Properties

| Label | Value | Selector |
|-------|-------|----------|
| "-- Select entity first --" | "" | `[data-testid="property-option-empty"]` |
| "Name" | "name" | `[data-testid="property-option-highschool-name"]` |
| "Type" | "type" | `[data-testid="property-option-highschool-type"]` |
| "District" | "district" | `[data-testid="property-option-highschool-district"]` |
| "Custom property..." | "custom" | `[data-testid="property-option-highschool-custom"]` |

### Instructor Properties

| Label | Value | Selector |
|-------|-------|----------|
| "-- Select entity first --" | "" | `[data-testid="property-option-empty"]` |
| "Name" | "name" | `[data-testid="property-option-instructor-name"]` |
| "Department" | "department" | `[data-testid="property-option-instructor-department"]` |
| "High School" | "highSchool" | `[data-testid="property-option-instructor-highschool"]` |
| "Years of Experience" | "experience" | `[data-testid="property-option-instructor-experience"]` |
| "Custom property..." | "custom" | `[data-testid="property-option-instructor-custom"]` |

### Step Properties (Step Conditions Only)

| Label | Value | Selector |
|-------|-------|----------|
| "-- Select entity first --" | "" | `[data-testid="property-option-empty"]` |
| "Status" | "status" | `[data-testid="property-option-step-status"]` |
| "Action" | "action" | `[data-testid="property-option-step-action"]` |
| "Comment" | "comment" | `[data-testid="property-option-step-comment"]` |
| "Custom property..." | "custom" | `[data-testid="property-option-step-custom"]` |

## Comparison Select Options

The Comparison dropdown contains these options:

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
| "is set" | "is-set" | `[data-testid="comparison-option-is-set"]` (Step conditions only) |
| "is not set" | "is-not-set" | `[data-testid="comparison-option-is-not-set"]` (Step conditions only) |

## Code Examples

### Working with Step Conditions

```javascript
// Open the conditionals section in step form
await page.click('[data-testid="conditionals-section-expander"]');

// Wait for the content to be visible
await page.waitForSelector('[data-testid="conditionals-section-content"]');

// Click the add condition button
await page.click('[data-testid="add-condition-button"]');

// Wait for the condition dialog to appear
await page.waitForSelector('[data-testid="step-condition-name-input"]');

// Fill in the condition name
await page.type('[data-testid="step-condition-name-input"]', 'highschool_in_district');

// Select entity type
await page.select('[data-testid="step-condition-entity-select"]', 'HighSchool');

// Select property
await page.select('[data-testid="step-condition-property-select"]', 'district');

// Select comparison
await page.select('[data-testid="step-condition-comparison-select"]', 'equals');

// Enter value
await page.type('[data-testid="step-condition-value-input"]', 'Metro District');

// Save the condition
await page.click('[data-testid="step-condition-save-button"]');

// Toggle a specific condition checkbox
await page.click('[data-testid="condition-checkbox-highschool_in_district"]');
```

### Creating a Welding Course Condition (Step)

```javascript
// Open the conditionals section in step form
await page.click('[data-testid="conditionals-section-expander"]');

// Wait for the content to be visible
await page.waitForSelector('[data-testid="conditionals-section-content"]');

// Click the add condition button
await page.click('[data-testid="add-condition-button"]');

// Wait for the condition dialog to appear
await page.waitForSelector('[data-testid="step-condition-name-input"]');

// Fill in the condition name
await page.type('[data-testid="step-condition-name-input"]', 'welding_course');

// Select entity type (Course)
await page.select('[data-testid="step-condition-entity-select"]', 'Course');

// Select property (Department)
await page.select('[data-testid="step-condition-property-select"]', 'department');

// Select comparison (equals)
await page.select('[data-testid="step-condition-comparison-select"]', 'equals');

// Enter value
await page.type('[data-testid="step-condition-value-input"]', 'Welding');

// Save the condition
await page.click('[data-testid="step-condition-save-button"]');

// Check that the condition appears in the list and select it
await page.waitForSelector('[data-testid="condition-checkbox-welding_course"]');
await page.click('[data-testid="condition-checkbox-welding_course"]');
```

### Creating a Scenario Condition

```javascript
// Click the New Scenario button
await page.click('[data-testid="new-scenario-button"]');

// Fill in the scenario name
await page.type('[data-testid="scenario-name-input"]', 'Welding Courses');

// Expand the scenario conditions section
await page.click('[data-testid="scenario-conditions-section-expander"]');

// Wait for the conditions content to be visible
await page.waitForTimeout(500);

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

## Troubleshooting Conditional Forms

1. **Empty Dropdowns**: If dropdown options aren't appearing after selecting an entity, take a screenshot to verify the state of the form and check that the entity selection was successful.

2. **Condition Not Appearing**: After saving a condition, verify that it appears in the conditions list before attempting to select it. 

3. **Invalid Selections**: Always use the exact values from the tables above when using `page.select()`. The dropdown values are case-sensitive.

4. **Wait Times**: The condition form may take a moment to update after selecting entity types or properties. Use `page.waitForTimeout(500)` if needed.

5. **Debugging Tips**: 
   - Take screenshots after each major interaction to verify form state
   - Verify element visibility before interacting
   - Check browser console for JavaScript errors
   - Validate that data-testid attributes match expected values
