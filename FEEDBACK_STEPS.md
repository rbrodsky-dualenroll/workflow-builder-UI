# Feedback Step Grouping Implementation

This document explains the feedback step grouping feature, related issues, and implemented fixes.

## Overview

The feedback step grouping feature allows creating parent-child relationships between steps in a workflow. 
A parent step (typically an approval step) can have one or more feedback steps associated with it. These 
feedback steps should:

1. Always appear immediately after their parent step
2. Move together with their parent when the parent is dragged
3. Maintain their relationship with the parent even when the parent step is edited
4. Follow the standard naming pattern for soft required fields as used in the DualEnroll core application

## Issues Fixed

We identified and fixed the following issues related to feedback step grouping:

1. **Parent ID Inconsistency**: When a parent step was moved, the parent IDs in the child steps were not 
   being consistently maintained, causing the parent-child relationship to break.

2. **Testing Documentation Mismatch**: The Puppeteer testing documentation referenced data-testid attributes 
   that didn't match the actual attributes in the DOM.

## Implementation Details

### 1. WorkflowOperations.js Changes

We updated two key functions:

- **moveStep**: Now explicitly preserves parent IDs in child steps when moving parent steps
- **updateStep**: Added logic to update all child steps when a parent step is modified

### 2. Testing Enhancements

Added the following testing utilities:

- **validateParentChildIDs**: A new function to validate parent-child ID consistency
- **feedbackParentChildIDTest.js**: A dedicated test script to verify parent-child ID maintenance
- **run-test.js**: A general-purpose test runner (renamed from test-feedback-grouping.js)

### 3. Documentation Updates

Updated the PUPPETEER_TESTING.md file to correctly reflect the actual DOM structure:

- Updated form field selectors to use the actual data-testid attributes (e.g., `field-title` vs `step-form-title`)
- Fixed the example for creating a workflow with feedback steps

## Testing the Changes

To test the feedback step functionality:

1. Start the development server:
   ```
   npm run dev
   ```

2. Run the feedback grouping test:
   ```
   npm run test:feedback-grouping
   ```

3. Run the parent-child ID consistency test:
   ```
   npm run test:parent-child-ids
   ```

Both tests should now pass, confirming that:
- Parent steps and their feedback children move together as a group
- Parent-child relationships remain consistent after edits and moves

## Feedback Step Soft Required Fields Pattern

Feedback steps in DualEnroll follow a specific pattern for their soft required fields and clearing of completion states. This pattern has been implemented in the workflow builder to match the core application logic:

### Soft Required Fields Pattern

If a step whose completion state is `parent_step_name` has feedback children, the feedback step's soft required field will follow this pattern:

- For student feedback: `parent_step_name_student_more_info`
- For high school feedback: `parent_step_name_hs_more_info`
- For parent feedback: `parent_step_name_parent_more_info`
- For approver feedback: `parent_step_name_approver_more_info`

For example, if a parent step has a completion state of `college_approval`, and it requests more information from a student, the feedback step's soft required field would be `college_approval_student_more_info`. Similarly, if it requests information from a parent, the field would be `college_approval_parent_more_info`.

### Clear States on Completion Pattern

Similarly, when a feedback step is completed, it needs to clear both its own completion state and the feedback trigger state from the parent step. The `clear_states_by_completion` parameter would include:

```ruby
'clear_states_by_completion' => {
  'complete' => [
    'feedback_step_name',
    'feedback_step_name_complete', 
    'parent_step_name',
    'parent_step_name_student_more_info' # or hs_more_info/approver_more_info
  ]
}
```

This pattern ensures that feedback steps properly transition back to their parent step upon completion.

## Next Steps

While the core functionality is now working correctly, future improvements could include:

1. Additional visual indicators showing parent-child relationships
2. Expanded testing for more complex scenarios
3. Improvement of the UI for adding feedback steps
4. Better visualization of the feedback flow lifecycle
