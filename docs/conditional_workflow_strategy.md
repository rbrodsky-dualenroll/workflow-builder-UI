# Conditional Workflow Strategy in DualEnroll

## Overview

This document explains the core strategy for handling conditional workflows in DualEnroll, specifically how conditional steps work and how completion states are managed through the initializer system.

## The Core Strategy

The fundamental approach to conditional workflows in DualEnroll is:

> **"For each conditional path in the workflow, identify which students DON'T meet the condition, and automatically set those completion states in the initializer to mark those steps as already completed."**

This strategy ensures that:
1. Students only see steps that are relevant to their specific situation
2. Conditional branches don't block workflow progression for students who don't meet the conditions
3. The workflow engine can properly sequence steps based on completion states

## How It Works

### 1. Condition Identification

When analyzing a workflow, the system identifies all conditional branches by:

- **Explicit conditions**: Steps marked as conditional with specific `workflowCondition` values
- **Implicit conditions**: Steps that have certain roles or titles that imply conditions (e.g., High School role steps imply `high_school` condition)
- **Content-based conditions**: Steps whose titles or descriptions contain keywords like "home school" or "non partner"

Example from `completionStateHandler.js`:
```javascript
// HARDCODED EDGE CASE: Check for conditions based on role
// High School role steps implicitly mean high_school condition
const hasHighSchoolRoleSteps = steps.some(step => 
  step.role === 'High School' || step.role === 'Counselor');

if (hasHighSchoolRoleSteps) {
  allConditions.add('high_school');
  console.log('Added implicit high_school condition based on High School role steps');
}
```

### 2. Completion State Mapping

For each condition, the system:

1. **Identifies all steps** that depend on that condition
2. **Determines the completion states** those steps would generate when completed
3. **Maps conditions to their completion states** for use in the initializer

Example from `completionStateHandler.js`:
```javascript
export const getStepCompletionState = (step) => {
  switch (step.stepType) {
    case 'Approval':
      return `${snakeCase(step.title)}_yes`;
    case 'Upload':
      return `${snakeCase(step.title)}_complete`;
    case 'ProvideConsent':
      return `${snakeCase(step.title)}_provided`;
    // ... etc
  }
};
```

### 3. Initializer Generation

The initializer class for each workflow target object (StudentDeCourse, StudentTerm, etc.) contains logic that:

1. **Evaluates each condition** for the current student/context
2. **Sets completion states** for conditional paths the student doesn't qualify for
3. **Ensures proper field merging** between different conditional paths

## Example Implementation

### The Three-Way High School Pattern

The most common pattern in DualEnroll workflows is the three-way branching for high school types:

- **Regular High School students**: Partner high schools with standard processes
- **Home School students**: Students who are home-schooled
- **Non-Partner students**: Students from high schools that don't have partnerships

Here's how this works in practice:

```ruby
# From studentDeCourseInitializer.js
is_home_school = student.high_school.is_home_school?
is_non_partner = student.high_school.is_non_partner?(college)
is_regular_high_school = !is_home_school && !is_non_partner

if is_home_school
  fields["home_school"] = true
  # Home School students don't get high_school or non_partner flags
elsif is_non_partner
  fields["non_partner"] = true
  # Non-partner students don't get high_school or home_school flags
else
  # Regular high school students
  fields["high_school"] = true
  fields["hs_student"] = true
  # Regular high school students don't get home_school or non_partner flags
end
```

### Completion State Auto-Setting

The system then automatically sets completion states for paths the student doesn't qualify for:

```ruby
# Auto-complete steps for students who don't qualify for high_school
unless !student.high_school.is_home_school? && !student.high_school.is_non_partner?(college)
  fields["confirm_enrollment_yes"] = true
  fields["upload_transcript_complete"] = true
  fields["review_prereqs_yes"] = true
end

# Auto-complete steps for students who don't qualify for home_school
unless student.high_school.is_home_school?
  fields["provide_home_school_affidavit_complete"] = true
  fields["review_home_school_affidavit_yes"] = true
end
```

### Cross-Path Completion State Merging

To ensure proper workflow progression, each conditional path needs completion states from the other paths:

```ruby
# High School students get completion states from other paths
if !student.high_school.is_home_school? && !student.high_school.is_non_partner?(college)
  # Set home_school completion states for high_school students
  fields["provide_home_school_affidavit_complete"] = true
  fields["review_home_school_affidavit_yes"] = true
  
  # Set non_partner completion states for high_school students
  fields["non_partner_verification_complete"] = true
end
```

## Technical Implementation Details

### Field Hash Strategy

The DualEnroll field hash system stores all workflow state as key-value pairs. The conditional strategy leverages this by:

1. **Pre-populating** completion states for irrelevant conditional paths
2. **Using soft required fields** to control step activation based on these completion states
3. **Merging completion states** across conditional paths to ensure workflow progression

### Soft Required Fields Pattern

Steps use `soft_required_fields` to specify which completion states must be present before they can activate:

```ruby
soft_required_fields: ['initialization_complete', 'high_school', 'confirm_enrollment_yes']
```

This step will only activate for:
- Students where initialization is complete AND
- Students who meet the high_school condition AND  
- Students who have completed the confirm_enrollment step with "yes"

### Condition Evaluation Order

The initializer evaluates conditions in a specific order:

1. **Set basic conditional flags** (high_school, home_school, non_partner)
2. **Set context-specific flags** (has_prereqs, wish_list, etc.)
3. **Auto-complete irrelevant conditional paths**
4. **Merge completion states across conditional paths**

## Benefits of This Strategy

### 1. Simplified Workflow Logic
- No complex branching logic needed in step definitions
- Each step simply checks for required completion states
- Conditional paths are handled transparently by the initializer

### 2. Consistent User Experience
- Students only see steps relevant to their situation
- No confusing conditional logic in the UI
- Clear linear progression through applicable steps

### 3. Maintainable Code
- Conditional logic is centralized in initializers
- Step definitions remain simple and focused
- Easy to add new conditional paths without modifying existing steps

### 4. Flexible Workflow Design
- Can create complex conditional workflows with simple configuration
- Easy to test different conditional scenarios
- Supports multiple overlapping conditions

## Common Patterns and Best Practices

### 1. Condition Naming
- Use clear, descriptive condition names (e.g., `high_school`, `home_school`, `has_prereqs`)
- Follow snake_case convention for consistency
- Make conditions mutually exclusive where appropriate

### 2. Completion State Naming
- Use consistent suffixes (`_yes`, `_complete`, `_provided`)
- Include step title in snake_case format
- Ensure completion state names are unique across the workflow

### 3. Initializer Organization
- Group related conditional logic together
- Comment complex conditional relationships
- Set basic flags before complex logic
- Handle cross-path merging at the end

### 4. Testing Conditional Workflows
- Test each conditional path independently
- Verify completion state merging works correctly
- Ensure no conditional path blocks workflow progression
- Test edge cases where multiple conditions overlap

## Debugging Conditional Workflows

When troubleshooting conditional workflow issues:

1. **Check the initializer logs** to see which conditions are being set
2. **Verify completion states** are being set correctly for each path
3. **Examine soft required fields** to ensure steps can activate properly
4. **Test cross-path merging** to ensure workflows don't get stuck

## Integration with Workflow Builder

The Workflow Builder implements this strategy through:

1. **Condition identification** in `completionStateHandler.js`
2. **Ruby code generation** in the initializer generators
3. **Automatic cross-path merging** in the completion state generation
4. **Export to fixture files** that implement the strategy in Ruby

This allows workflow designers to create complex conditional logic through a visual interface while maintaining the robust underlying implementation strategy.
