# Select Options Testability Guide

This document outlines a standardized approach for adding data-testid attributes to select elements and their options to improve testability with Puppeteer.

## The Problem

When using Puppeteer to interact with select elements, we currently use the `page.select()` method with exact string values:

```javascript
// Current approach
await page.select('[data-testid="scenario-condition-property-select"]', 'schoolType');
```

This approach has several drawbacks:
1. It requires knowledge of the exact option values which may change
2. It doesn't follow our pattern of using data-testid attributes for all selectable elements
3. It's harder to maintain and less consistent with the rest of our testing approach

## Proposed Solution

We should add data-testid attributes to both the select elements (which we already do) and each option within them, following a consistent naming pattern:

1. The select element will have a data-testid like `[data-testid="scenario-condition-property-select"]`

2. Each option within the select should have a data-testid that combines the select's data-testid with the option's value:
   - `[data-testid="scenario-condition-property-select-schoolType"]`
   - `[data-testid="scenario-condition-property-select-age"]`
   - `[data-testid="scenario-condition-property-select-program"]`

## Implementation Example

In React, this would look like:

```jsx
<select data-testid="scenario-condition-property-select">
  <option value="" data-testid="scenario-condition-property-select-default">-- Select a property --</option>
  <option value="schoolType" data-testid="scenario-condition-property-select-schoolType">School Type</option>
  <option value="age" data-testid="scenario-condition-property-select-age">Age</option>
  <option value="program" data-testid="scenario-condition-property-select-program">Program</option>
</select>
```

## How to Use in Tests

With this improved approach, a test script would look like:

```javascript
// Instead of:
await page.select('[data-testid="scenario-condition-property-select"]', 'schoolType');

// We can do:
await page.click('[data-testid="scenario-condition-property-select-schoolType"]');
```

## Apply This Pattern To

This pattern should be applied to all select elements throughout the application:

1. **Scenario Condition Form:**
   - Entity select: `scenario-condition-entity-select-Student`
   - Property select: `scenario-condition-property-select-schoolType`
   - Comparison select: `scenario-condition-comparison-select-equals`

2. **Step Form:**
   - Step type select: `step-form-type-Approval`
   - Role select: `field-role-College`
   - Sub-workflow select: `field-workflow_category-PerCourse`

3. **Any other select elements in the application**

## Benefits

1. **Consistency**: Follows the same pattern as other interactive elements
2. **Resilience**: Tests won't break if the display text or value of an option changes
3. **Clarity**: Makes it easier to understand which option is being selected in tests
4. **Discoverability**: Options can be more easily found when inspecting the DOM

## Implementation Plan

1. Identify all select elements in the application
2. Add data-testid attributes to each option following the pattern
3. Update tests to use the new selectors
4. Update documentation to reflect the new pattern

## Conclusion

This approach will significantly improve the testability of select elements in our application, making our tests more robust and maintainable in the long run.
