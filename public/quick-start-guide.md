# DualEnroll Workflow Builder - Quick Start Guide

## What is the Workflow Builder?

The DualEnroll Workflow Builder is a tool for creating visual representations of workflow processes. It allows you to design, visualize, and prototype workflow steps that can be shared with clients and stakeholders.

## Getting Started

### Creating Your First Workflow

1. **Add a Step**: Click the "Add Step" button at the bottom of the workflow area.
2. **Configure the Step**:
   - Select the step type (Approval, Upload, or Information)
   - Add a title and description
   - Assign the role responsible for this step
   - Configure any additional options specific to the step type
3. **Save the Step**: Click "Save Step" to add it to your workflow.
4. **Add More Steps**: Repeat the process to build out your complete workflow.

### Importing a Sample Workflow

To see an example workflow:

1. Click the "Import Workflow" button at the top of the page.
2. Select the `sample-workflow.json` file from your file system.
3. The sample workflow will load, showing you different step types and configurations.

## Step Types Explained

### Approval Step

An approval step requires a user to review and approve or decline something. Key features:

- **Role**: Who is responsible (College, High School, Student, etc.)
- **Action Options**: The buttons or choices presented to the user
- **Feedback Loops**: What happens if more information is needed

### Upload Step

An upload step requires documents or files to be submitted. Key features:

- **File Types**: What kinds of files are required
- **Labels**: Clear descriptions of what should be uploaded

### Information Step

An information step displays data or instructions to the user. Key features:

- **Information Displays**: The content shown to the user
- **Usually used for confirmations or providing context**

## Tips for Effective Workflows

1. **Keep it Simple**: Start with the minimum number of steps needed
2. **Clear Descriptions**: Make sure each step has a clear purpose
3. **Logical Flow**: Ensure steps follow a logical progression
4. **Consider User Experience**: Think about how users will interact with each step
5. **Use Conditionals**: Only show steps when they're needed

## Saving Your Work

- Click "Save Workflow" to download your workflow as a JSON file
- Keep these files for future reference or to continue editing later
- Share JSON files with team members for collaboration
