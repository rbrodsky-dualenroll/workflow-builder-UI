# DualEnroll Workflow Builder

A sophisticated workflow builder application for creating, prototyping, and demonstrating DualEnroll workflow processes. This tool allows you to rapidly design complex enrollment workflows and export them directly to Ruby fixtures and templates for implementation.

## Overview

The DualEnroll Workflow Builder enables you to:

1. **Create complex workflow visualizations** with various step types
2. **Configure conditional logic** to create different user paths based on specific criteria
3. **Define reusable conditions** that can be applied across workflow steps
4. **Customize steps** with role-based permissions and actions
5. **Implement specialized step types** such as API integrations and consent forms
6. **Save, export, and import workflows** as JSON for easy sharing
7. **Export to development-ready fixtures** that generate Ruby code, initializer classes, and view templates

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

### Deployment to GitHub Pages

This project is configured for easy deployment to GitHub Pages:

1. Install the gh-pages package if not already installed:
```bash
npm install --save-dev gh-pages
```

2. Make sure your repository is properly configured in vite.config.js:
```javascript
base: '/your-repository-name/',  // Replace with your actual repository name
```

3. Deploy using one of these methods:

   **Method 1: Using npm script**
   ```bash
   npm run deploy
   ```
   
   **Method 2: Using GitHub Actions**
   - Push your changes to the main branch
   - GitHub Actions will automatically build and deploy to the gh-pages branch

4. Verify deployment by visiting your GitHub Pages URL (typically https://your-username.github.io/your-repository-name/)

## Core Features

### Step Types

The workflow builder supports multiple specialized step types:

- **Approval**: Configuration for review/approval processes with customizable actions
- **Upload**: For collecting documents with file type specifications
- **Information**: For displaying information to users
- **Provide Consent**: Specialized step for parent/guardian consent collection
- **Check Holds**: Automated step to verify if students have holds on their accounts
- **Register Via API**: System integration step to register students via SIS APIs
- **Resolve Issue**: Step for handling exceptions and issues in the workflow

### Workflow Conditions

The condition builder allows for creating and reusing complex conditions:

- Define conditions based on entity/property combinations (e.g., `student.home_school == true`)
- Create custom properties for specialized needs
- Apply conditions to determine when steps should be shown
- Manage conditions at the workflow level for reuse across steps

### Feedback Loops

Create parent-child relationships between steps to handle feedback processes:

- Set up approval steps that can request additional information
- Create proper feedback steps that are linked to their parent steps
- Maintain consistent relationships when steps are moved or edited
- Follow DualEnroll's standard naming patterns for feedback loops

### Role-Based Configuration

Steps can be assigned to specific roles:

- College
- High School
- Student
- Parent
- Approver
- Dean
- System (for automated steps)

### Workflow Categories

Steps can be categorized into different execution patterns:

- **Once Ever**: Executed only once per student
- **Per Year**: Executed once per academic year
- **Per Term**: Executed once per term
- **Per Course**: Executed for each course registration

## Developer Export Features

The Workflow Builder includes powerful export capabilities for development teams:

1. **Ruby Fixture Generation**: Export workflow configuration as a complete Ruby fixture file
2. **Initializer Classes**: Generate Ruby classes that handle workflow conditions and initialization
3. **View Templates**: Create ERB template files for each UI step in the workflow
4. **Multi-file ZIP Export**: Package all generated files into a convenient ZIP archive
5. **Table Column Generation**: Convert table configurations into proper Ruby accessor code
6. **Action Option Mapping**: Map UI action options to proper DualEnroll workflows

## Usage Guide

### Creating a Workflow

1. Start a new workflow or import an existing one
2. Add steps by clicking the "Add Step" button
3. Configure each step with appropriate settings
4. Organize steps in the desired sequence
5. Apply conditions to control when steps appear
6. Save your workflow for future use

### Working with Conditions

1. Create reusable conditions in the Conditions Manager
2. Apply conditions to steps to control when they appear
3. Use conditions to create branching logic in your workflow

### Creating Feedback Loops

1. Edit a step and select "Add Feedback Step"
2. Configure the feedback recipient (Student, High School, Parent, Approver)
3. Set up the feedback step's properties (title, role, etc.)
4. Save the workflow to maintain the parent-child relationship

### Exporting for Development

1. Click "Export for Dev Team"
2. Enter college details (name, ID, etc.)
3. Select export options (ZIP or single file)
4. Choose which components to include (application fields, initializers, view templates)
5. Generate and download the export

### Display Mode

Display Mode provides a simplified, read-only presentation of your workflow.

1. Toggle Display Mode using the **Display Mode** button in the header.
2. Choose a workflow category filter and toggle conditions to preview how steps appear for different paths.
3. Exit Display Mode using the same button to return to the builder.

## Data Model

### Step Structure

```json
{
  "id": "unique-step-id",
  "stepType": "Approval | Upload | Information | ProvideConsent | CheckHolds | RegisterViaApi | ResolveIssue",
  "title": "Step Title",
  "role": "College | High School | Student | Parent | Approver | Dean | System",
  "workflow_category": "Once Ever | Per Year | Per Term | Per Course",
  "description": "Description of this step",
  "conditional": true | false,
  "workflowCondition": ["condition-name-1", "condition-name-2"],
  "parentId": "parent-step-id",  // For feedback steps
  
  // Type-specific properties
  
  // For Approval steps
  "actionOptions": [
    { "label": "Approve", "value": "approve-yes" },
    { "label": "Decline", "value": "no" }
  ],
  
  // For Upload steps
  "fileUploads": [
    { "fileType": "transcript", "label": "Transcript", "required": true }
  ],
  
  // For Information steps
  "informationDisplays": [
    { "content": "Student GPA information", "style": "info" }
  ],
  
  // Common optional properties
  "tableColumns": [
    { "label": "Student Name", "value": "target.student.display_name" },
    { "label": "Course Number", "value": "course.number" }
  ],
  "comments": {
    "required": true | false,
    "public": true | false
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
    "value": "comparison_value"
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
│   │   │   └── StepForm.jsx       # Main step form component
│   │   ├── WorkflowBuilder/       # Workflow builder components
│   │   │   ├── export/            # Export functionality
│   │   │   │   ├── rubyFixtureExporter.js  # Ruby fixture generation
│   │   │   │   ├── multiFileExporter.js    # ZIP archive generation
│   │   │   │   ├── initializerGenerator.js # Ruby class generation
│   │   │   │   └── views/                  # View template generation
│   │   │   ├── hooks/             # Custom hooks
│   │   │   ├── modals/            # Modal components
│   │   │   ├── WorkflowBuilder.jsx # Main builder component
│   │   │   ├── WorkflowContent.jsx # Workflow step container
│   │   │   ├── WorkflowHeader.jsx  # Header component
│   │   │   ├── WorkflowConditionManager.jsx # Condition management
│   │   │   └── ...
│   │   ├── WorkflowStep/          # Step visualization components
│   │   └── common/                # Shared UI components
│   ├── utils/              # Utility functions
│   ├── App.jsx            # Main application component
│   ├── App.css            # Main application styles
│   ├── index.css          # Global styles
│   └── main.jsx           # Application entry point
├── docs/                  # Documentation
│   ├── field_hash_documentation.md    # ActiveFlow fields documentation
│   ├── input_fields_documentation.md  # Input field documentation
│   └── table_columns_documentation.md # Table column documentation
└── puppeteer_testing_documentation/   # Testing documentation
```

## Feature Highlights

### Developer-Friendly Exports

- Export workflows as complete Ruby fixtures ready for implementation
- Generate view templates with proper structure and naming
- Include initializer classes that handle conditional logic
- Package everything into a single ZIP archive

### Table Column Configuration

- Define columns with proper Ruby accessor paths
- Include input columns for data collection
- Configure column properties like required fields and validation

### Action Option Form Fields

- Associate form fields with specific action options
- Configure field validation and properties
- Map action options to DualEnroll workflows

### Feedback Step Management

- Create and maintain parent-child relationships
- Follow DualEnroll's standard naming patterns for feedback loops
- Properly clear form states when feedback is completed

## Best Practices

- Use standard document types from the dropdown for consistency
- Create reusable conditions for common logic patterns
- Follow DualEnroll's naming conventions for steps
- Test your workflow export to ensure generated code matches your expectations
- Document your workflow design decisions

## Known Issues/Next Steps in Development

- Initializer writer needs to filter by workflow category
- Feedback steps need to be more robust and allow for multiple feedback steps to the same role with different details
- View template generation could be improved to handle more specialized cases

## Future Enhancements

- Advanced previewer to simulate workflow from different user perspectives
- Step cloning and templates library
- Advanced validation and error checking
- Integration with live DualEnroll systems
- Workflow statistics and metrics
- Collaborative editing features