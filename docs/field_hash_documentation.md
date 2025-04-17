# DualEnroll Field Hash Documentation

This document explains how field hashes work in DualEnroll's ActiveFlow, ActiveFlowStep, and various step type models, to help implement a proper export format from the workflow builder to Ruby fixture files.

## Overview of Field Hashes

In DualEnroll, field hashes are serialized Ruby hashes that store key-value pairs used by workflow steps. These fields control workflow behavior, store state, and determine which steps are activated next.

## ActiveFlow Fields Hash

### Purpose
The `fields` hash in ActiveFlow is the central state repository for the entire workflow. It stores:
- Information about the target object (e.g., StudentDeCourse, StudentTerm, etc.)
- State of completed workflow steps
- Any data captured during user interactions
- Conditional branching indicators

### Key Field Patterns

1. **Target Object Identifiers**:
   - `student_de_course_id`, `student_term_id`, etc. - stores the ID of the target object
   - Always included automatically when a workflow is launched

2. **Step Completion Fields**:
   - Generated from a step's `completion_state` parameter (e.g., `review_course`, `upload_transcript`)
   - A `_yes`, `_no`, or other suffix is added to indicate the completion result
   - Example: `review_course_yes` indicates approval, `review_course_no` indicates rejection

3. **User Association Fields**:
   - `<role>_user_id` - stores the user ID associated with a step of this role
   - Example: `coll_user_id` - the college user who handled the workflow

4. **Conditional Fields**:
   - Fields used for branching logic (e.g., `has_prereqs`, `parent_consent_required`)
   - Set dynamically based on target object properties or prior step outcomes

5. **Metadata Fields**:
   - `active_flow_step_id` - tracks which step is currently active in the flow
   - `failure_reason` - stores why a workflow failed (if applicable)

### Serialization
The fields hash is serialized to a binary format in the database using Rails' serialization mechanism.

## ActiveFlowStep Parameters

### Purpose
Each step has a `parameters` hash that configures its behavior, including:
- Which fields to use/set in the ActiveFlow fields hash
- How to handle completion states
- Special parameters for specific step types

### Common Parameters

1. **`completion_state`**: 
   - Defines what field will be set upon step completion
   - Example: `"completion_state" => "review_prereqs"`
   - When completed with "yes", sets `review_prereqs_yes = true` in the fields hash

2. **`document_class`** and **`kinds`**:
   - For document upload steps, specifies document class and allowed types
   - Example: `"document_class" => "StudentDocument", "kinds" => ["transcript", "test_scores"]`

3. **`clear_states_by_completion`**:
   - Allows steps to clear specific fields when completed
   - Example:
     ```ruby
     "clear_states_by_completion" => {
       "yes" => ["review_student_record", "review_student_record_yes"]
     }
     ```

4. **`update_attributes`**:
   - Allows updating attributes on the target object
   - Example: `"update_attributes" => { "student_de_course" => "course_section_id" }`

5. **Step-specific Parameters**:
   - `mailer_signatures` - For notification steps
   - `subordinate_registration_active_flow_target_object_type` - For waiting steps
   - `consent` - For consent steps
   - `inject_subordinate_registration_active_flow_fields` - For field injection between workflows

## Soft Required Fields

Soft required fields are crucial for controlling step activation. They define which fields must be present in the fields hash before a step can be activated.

### Characteristics:
- Stored as serialized arrays in the `soft_required_fields` attribute
- Can refer to completion states from earlier steps
- Can include boolean conditions like `has_prereqs` or `hs_student`

### Examples:
```ruby
["initialization_complete"] # Simple requirement
["parent_consent_required", "review_student_record_yes"] # Multiple requirements
["hs_student", "review_prereqs_yes", "has_prereqs", "upload_transcript_complete"] # Complex requirements
```

A step becomes eligible for activation when ALL its soft required fields are present in the fields hash.

## Step Type-Specific Field Patterns

### Approval Steps
- Primary parameter: `"completion_state" => "step_name"`
- Creates fields: `step_name_yes`, `step_name_no`, or `step_name_<custom>`
- Example: `review_course_yes = true` when approved

### Upload Document Steps
- Parameters: `"document_class"`, `"kinds"`, `"completion_state"`
- Creates fields: `upload_transcript_complete = true` when completed
- Often used with clear states to handle returns/revisions

### Wait For Steps
- Used to synchronize workflows (one-time, per-term, and per-course)
- Fields: `one_time_workflow_complete`, `student_term_complete`
- Waits until subordinate workflow sets these fields

### Initialize Steps
- First step in most workflows
- Sets: `initialization_complete = true`
- May set conditional fields like `has_prereqs`, `parent_consent_required`

### System Processing Steps
- Handle data exchange, form generation, API calls
- Create fields like `enrollment_form_workflow_file_id`
- Set statuses like `registration_via_colleague_api_processed`

## Field Hash Implementation In Ruby Fixtures

When creating fixture files, field hash data is implicit in the ActiveFlowStepTrigger definitions. The `soft_required_fields` array and `parameters` hash determine how fields propagate through the workflow.

Example from fixture:
```ruby
{
  active_flow_definitions: [msjc_registration_active_flow_definition],
  name: 'Review Course',
  version: msjc_registration_active_flow_definition_version_number,
  description: '',
  participant: 'College',
  step_class: 'ApprovalStep',
  view_name_override: 'active_flow_steps/course_registration/college/review_course',
  parameters: {
    'completion_state' => 'review_prereqs',
  },
  participant_role: 'enrollment',
  soft_required_fields: ['home_school', 'upload_transcript_complete', 'has_prereqs']
}
```

## Step Class-Specific Field Patterns

Different step classes manipulate the fields hash in specific ways:

### ApprovalStep
This is the most common step type, used for review/approval decisions by any role.

Parameters:
- `completion_state` - Required - The base field name to set on completion
- `clear_states_by_completion` - Optional - Fields to clear on completion
- `can_sequence` - Optional - Whether step can be completed in sequence with others

Completion Results:
- Yes: Sets `<completion_state>_yes = true`
- No: Sets `<completion_state>_no = true`
- Custom: Sets `<completion_state>_<custom> = true`

### UploadDocumentStep
Used to collect documents from users.

Parameters:
- `completion_state` - Required - Field name to set when completed
- `document_class` - Required - The document model class (e.g., "StudentDocument")
- `kinds` - Required - Array of allowed document types
- `clear_states_by_completion` - Optional - Fields to clear on completion

Completion Results:
- Sets `<completion_state>_complete = true`
- If the user returns the document, sets `<completion_state>_return = true`

### InitializeStep
First step in a workflow, sets up initial conditions and fields.

Parameters:
- Usually minimal or none

Completion Results:
- Sets `initialization_complete = true`
- May set conditional fields based on target object properties

### WaitForSubordinateRegistrationActiveFlowCompletionStep
Coordinates between multiple workflows (e.g., one-time, per-term, per-course).

Parameters:
- `subordinate_registration_active_flow_target_object_type` - The target object type to wait for
- `subordinate_registration_active_flow_category` - The category of workflow to wait for
- `completion_state` - Field to set when subordinate flow completes
- `inject_subordinate_registration_active_flow_fields` - Optional fields to copy from subordinate flow

Completion Results:
- Sets `<completion_state> = true`

### ProvideConsentStep
Used for collecting parental or other consent.

Parameters:
- `consent` - The type of consent to collect (e.g., "all")

Completion Results:
- Sets `parent_consent_provided = true`

### CompleteRegistrationStep
Final step in a successful workflow.

Parameters:
- Minimal or none

Completion Results:
- May set completion-specific fields
- Triggers overall workflow completion

### DeclineRegistrationStep
Handles workflow rejection/termination.

Parameters:
- `mailer_signatures` - Notification configurations for rejection

Completion Results:
- Sets failure-related fields
- Triggers workflow termination
