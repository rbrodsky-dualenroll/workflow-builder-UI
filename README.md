# DualEnroll Workflow Builder

A sophisticated workflow builder application for creating, prototyping, and demonstrating DualEnroll workflow processes.

## Overview

The DualEnroll Workflow Builder enables you to:

1. Create complex workflow visualizations with various step types
2. Configure conditional logic and workflow scenarios
3. Define reusable conditions across workflow steps
4. Customize steps with role-based permissions and actions
5. Implement specialized step types such as API integrations and consent forms
6. Save, export, and import workflows as JSON for easy sharing
7. Preview how workflows will appear from different user perspectives

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone this repository
2. Install dependencies:
```bash
npm install
```
3. Start the development server:
```bash
npm run dev
```

## Core Features

### Step Types

The workflow builder supports multiple specialized step types:

- **Approval**: Configuration for review/approval processes with customizable actions
- **Document Upload**: For collecting documents with file type specifications
- **Information**: For displaying information to users
- **Provide Consent**: Specialized step for parent/guardian consent collection
- **Check Holds**: Automated step to verify if students have holds on their accounts
- **Register Via API**: System integration step to register students via SIS APIs
- **Resolve Issue**: Step for handling exceptions and issues in the workflow

### Scenarios

Scenarios allow for creating variant workflows based on conditions:

- **Main Workflow**: Default path for most users
- **Conditional Scenarios**: Alternative paths based on specific conditions
- **Master View**: Consolidated view of all scenarios for administration

### Workflow Conditions

The new condition builder allows for creating and reusing complex conditions:

- Define conditions based on entity/property combinations
- Create custom properties for specialized needs
- Apply conditions to determine when steps should be shown
- Manage conditions at the workflow level for reuse across steps

### Role-Based Configuration

Steps can be assigned to specific roles:

- College
- High School
- Student
- Parent
- Approver
- Dean
- System (for automated steps)

### Sub-Workflows

Steps can be categorized into different execution patterns:

- **Once Ever**: Executed only once per student
- **Per Year**: Executed once per academic year
- **Per Term**: Executed once per term
- **Per Course**: Executed for each course registration

## Usage Guide

### Creating a Workflow

1. Start a new workflow or import an existing one
2. Add steps by clicking the "Add Step" button
3. Configure each step with appropriate settings
4. Organize steps in the desired sequence
5. Save your workflow for future use

### Managing Scenarios

1. Create scenarios for different condition-based paths
2. Configure the condition that triggers each scenario
3. Add scenario-specific steps
4. Use Master View to see all scenarios at once

### Working with Conditions

1. Create reusable conditions in the Conditions Manager
2. Apply conditions to steps to control when they appear
3. Use conditions to create branching logic in your workflow

### Specialized Step Configuration

Each step type has unique configuration options:

- **Approval Steps**: Configure action buttons, feedback loops
- **Upload Steps**: Specify required documents and file types
- **Information Steps**: Define what information to display
- **Register Via API**: Automated SIS integration (System role only)
- **Provide Consent**: Configure consent type for parents/guardians

## Data Model

### Step Structure

```json
{
  "id": "unique-step-id",
  "stepType": "Approval | Upload | Information | ProvideConsent | CheckHolds | RegisterViaApi | ResolveIssue",
  "title": "Step Title",
  "role": "College | High School | Student | Parent | Approver | Dean | System",
  "subworkflow": "Once Ever | Per Year | Per Term | Per Course",
  "description": "Description of this step",
  "conditional": true | false,
  "workflowCondition": "named-condition-reference",
  
  // Type-specific properties
  
  // For Approval steps
  "actionOptions": [
    { "label": "Approve", "value": "approve-yes" },
    { "label": "Decline", "value": "decline-no" }
  ],
  
  // For Upload steps
  "fileUploads": [
    { "fileType": "pdf", "label": "Transcript", "required": true }
  ],
  
  // For Information steps
  "informationDisplays": [
    { "content": "Student GPA information", "style": "info" }
  ],
  
  // Common optional properties
  "tableColumns": ["Student Name", "Course Number", "CRN"],
  "comments": {
    "required": true | false,
    "public": true | false
  },
  "feedbackLoops": {
    "recipient": "College | High School | Student | Parent",
    "nextStep": "step-id-reference"
  }
}
```

### Condition Structure

```json
{
  "condition_name": {
    "entity": "student | course | section | instructor | high_school | term | registration",
    "property": "property_name",
    "comparison": "== | != | > | < | >= | <= | includes | present | blank | true | false",
    "value": "comparison_value",
    "fields": ["condition_name"]
  }
}
```

## Project Structure

```
react-workflow-app/
├── public/                # Static assets
├── src/
│   ├── components/        # React components
│   │   ├── StepForm/      # Step configuration forms
│   │   │   ├── sections/  # Specialized form sections
│   │   │   │   ├── conditionals/  # Condition building components
│   │   │   │   └── ...
│   │   │   └── StepForm.jsx       # Main step form component
│   │   ├── WorkflowBuilder/       # Workflow builder components
│   │   │   ├── hooks/             # Custom hooks
│   │   │   ├── modals/            # Modal components
│   │   │   ├── WorkflowBuilder.jsx # Main builder component
│   │   │   ├── WorkflowContent.jsx # Workflow step container
│   │   │   ├── WorkflowHeader.jsx  # Header component
│   │   │   ├── WorkflowConditionManager.jsx # Condition management
│   │   │   ├── ScenarioManager.jsx # Scenario management
│   │   │   └── ...
│   │   ├── WorkflowStep/          # Step visualization components
│   │   └── common/                # Shared UI components
│   │       ├── Card.jsx
│   │       ├── CollapsibleCard.jsx
│   │       ├── FormField.jsx
│   │       └── ...
│   ├── utils/              # Utility functions
│   │   ├── conditionalUtils.js    # Condition parsing/formatting
│   │   ├── workflowUtils.js       # Workflow helpers
│   │   └── ...
│   ├── App.jsx            # Main application component
│   ├── App.css            # Main application styles
│   ├── index.css          # Global styles
│   └── main.jsx           # Application entry point
└── package.json           # Dependencies and scripts
```

## Feature Highlights

### Conditional Logic Builder
- Visual interface for building complex conditions
- Entity and property-based condition creation
- Custom property support for specialized needs
- Reusable conditions across workflow steps

### Step Templates
- Pre-configured step templates for common processes
- Specialized templates like RegisterViaAPI with enforced settings
- Role-appropriate configurations

### Workflow Organization
- Drag and reorder steps
- Move steps between scenarios
- Master view for comprehensive workflow management

### Import/Export
- Save workflows as JSON
- Import existing workflows
- Share workflows between team members

## Future Enhancements

- Advanced previewer to simulate workflow from different user perspectives
- Step cloning and templates library
- Advanced validation and error checking
- Integration with live DualEnroll systems
- Workflow statistics and metrics
- Collaborative editing features

## Best Practices

- Start with the Main workflow for standard processes
- Use scenarios sparingly for truly different paths
- Create reusable conditions for consistent logic
- Test workflows from different role perspectives
- Use appropriate step types for each process
- Document your workflow design decisions
