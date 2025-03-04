# DualEnroll Workflow Builder

A clickable-prototype workflow builder application that allows quick creation of mock workflows for client demonstrations.

## Overview

This workflow builder tool enables you to:

1. Create visual workflow steps
2. Configure steps with various properties (approvals, uploads, information displays)
3. Rearrange steps in the workflow
4. Save workflows as JSON for later import
5. Visualize how the workflow will appear to users

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
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

## Usage Guide

### Creating a Workflow

1. Click the "Add Step" button to create a new workflow step
2. Select the step type (Approval, Upload, or Information)
3. Configure the step properties (role, conditions, actions, etc.)
4. Click "Save Step" to add it to the workflow
5. Repeat for each step in your workflow

### Editing Steps

- Click the pencil icon on any step to edit its properties
- Use the up/down arrows to reorder steps in the workflow
- Click the trash icon to delete a step

### Saving & Importing Workflows

- Click "Save Workflow" to export the workflow as JSON
- Use the "Import Workflow" button to load a previously created workflow

## Core Data Model

Each workflow step is represented as a JSON object with these properties:

```json
{
  "id": "unique-step-id",
  "stepType": "Approval | Upload | Information",
  "title": "Step Title",
  "role": "College | High School | Student | Parent | System",
  "description": "Description of this step",
  "conditional": true | false,
  "triggeringCondition": "condition logic (e.g., student.gpa > 3.0)",
  
  // For Approval steps
  "actionOptions": [
    { "label": "Approve", "value": "approve-yes" },
    { "label": "Decline", "value": "decline-no" }
  ],
  
  // For Upload steps
  "fileUploads": [
    { "fileType": "pdf", "label": "Transcript" }
  ],
  
  // For Information steps
  "informationDisplays": [
    "Student GPA information",
    "Course registration details"
  ],
  
  // Additional properties
  "feedbackLoops": {
    "recipient": "Student | High School | College",
    "nextStep": "Name of next step"
  },
  "comments": {
    "required": true | false,
    "public": true | false
  }
}
```

## Project Structure

```
react-workflow-app/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── WorkflowBuilder.jsx        # Main workflow builder component
│   │   ├── WorkflowBuilder.css        # Component-specific styles
│   │   ├── WorkflowStep.jsx           # Component for individual workflow steps
│   │   └── StepForm.jsx               # Form for creating/editing steps
│   ├── App.jsx          # Main application component
│   ├── App.css          # Main application styles
│   ├── index.css        # Global styles
│   └── main.jsx         # Application entry point
└── package.json         # Dependencies and scripts
```

## Future Enhancements

- Add ability to create branching workflows
- Add more step types specific to DualEnroll workflow needs
- Create a previewer to see the workflow from different user perspectives
- Implement drag-and-drop for step reordering
- Add ability to copy steps
- Allow importing steps from existing workflows
- Add workflow validation to highlight potential issues

## Workflow Examples

Based on the provided documentation, typical workflow steps might include:
- Parent Consent
- Counselor Approval
- College Review
- Document Upload
- Instructor Approval
- System Integration
