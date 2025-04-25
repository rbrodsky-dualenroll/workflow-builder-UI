/**
 * Multi-File Exporter
 * 
 * This module provides functionality to export multiple files as a zip archive.
 */

import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { generateRubyFixture, identifyWorkflowCategories } from './rubyFixtureExporter';
import { generateInitializerClass } from './initializerGenerator';
import { snakeCase } from './utils';
import { addViewTemplatesToZip } from './views/viewTemplateExporter';

/**
 * Generate and download a zip file containing multiple exported files
 * @param {Object} workflowData - The workflow data from the WorkflowBuilder
 * @param {Object} collegeData - College information (name, id, city, etc.)
 * @param {Object} options - Additional options for generation
 * @returns {Promise} - Promise that resolves when the zip file is generated and downloaded
 */
export const exportZipArchive = async (workflowData, collegeData, options = {}) => {
  console.log('Workflow conditions for initializer:', workflowData.conditions);
  try {
    // Create a safe variable name for the college
    const collegeVarName = collegeData.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Create a new zip file
    const zip = new JSZip();
    
    // Generate the main fixture file
    const mainFixtureCode = generateRubyFixture(workflowData, collegeData, options);
    zip.file(`${collegeVarName}_fixture.rb`, mainFixtureCode);
    
    // Identify workflow categories to determine which initializer files to generate
    const workflowCategories = identifyWorkflowCategories(workflowData.scenarios);
    
    if (options.includeInitializers !== false) {
      // Create a folder for initializer classes
      const initializersFolder = zip.folder('initializers');
      
      // Generate initializer classes for each workflow category
      workflowCategories.forEach(category => {
        // Determine the target object type
        const targetObjectType = category.targetObject;
        
        // Generate the initializer class code
        // Ensure we're passing the workflow conditions explicitly to the initializer generator
        const enhancedWorkflowData = {
          ...workflowData,
          conditions: workflowData.conditions || {}
        };
        
        console.log(`Generating initializer for ${targetObjectType} with ${Object.keys(enhancedWorkflowData.conditions || {}).length} conditions`);
        
        const initializerCode = generateInitializerClass(
          enhancedWorkflowData,
          collegeVarName,
          targetObjectType
        );
        
        // The class name must match exactly what Rails expects based on the file path
        const classNameSuffix = category.targetObject === 'StudentDeCourse' ? 'CourseRegistration' : category.targetObject;
        const className = `Initialize${collegeVarName.charAt(0).toUpperCase() + collegeVarName.slice(1)}${classNameSuffix}Step`;
        
        // File name should match exactly the format seen in existing files
        // Manually handle the specific cases we've seen in screenshots
        let snakeClassNameSuffix = '';
        if (classNameSuffix === 'CollegeStudentApplication') {
          snakeClassNameSuffix = 'college_student_application';
        } else if (classNameSuffix === 'CourseRegistration') {
          snakeClassNameSuffix = 'course_registration';
        } else if (classNameSuffix === 'StudentTerm') {
          snakeClassNameSuffix = 'student_term';
        } else {
          // Fallback to general snakeCase if we encounter other types
          snakeClassNameSuffix = snakeCase(classNameSuffix);
        }
        
        const snakeCaseFilename = `initialize_${collegeVarName}_${snakeClassNameSuffix}_step.rb`;
        
        // Update the initializer code to ensure the class name matches exactly
        const updatedInitializerCode = initializerCode.replace(
          /class Initialize(.*?)Step/,
          `class ${className}`
        );
        
        // Add the initializer class file to the zip
        initializersFolder.file(snakeCaseFilename, updatedInitializerCode);
      });
    }
    
    // Include view templates if requested
    if (options.includeViewTemplates !== false) {
      const viewCount = addViewTemplatesToZip(zip, workflowData, collegeVarName);
      console.log(`Added ${viewCount} view templates to the ZIP archive`);
    }
    
    // Generate a README with instructions
    const readmeContent = generateReadme(collegeData, workflowCategories, options);
    zip.file('README.md', readmeContent);
    
    // Generate and download the zip file
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${collegeVarName}_workflow_export.zip`);
    
    return true;
  } catch (error) {
    console.error('Error generating zip archive:', error);
    throw error;
  }
};

/**
 * Generate a README file with instructions
 * @param {Object} collegeData - College information
 * @param {Array} workflowCategories - List of workflow categories
 * @param {Object} options - Export options
 * @returns {string} - README content
 */
const generateReadme = (collegeData, workflowCategories, options = {}) => {
  const collegeName = collegeData.name;
  const collegeVarName = collegeData.name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const collegeCapitalized = collegeVarName.charAt(0).toUpperCase() + collegeVarName.slice(1);
  
  // Generate content about view templates if included
  const viewTemplatesSection = options.includeViewTemplates !== false ? `
### View Templates
This export includes view templates for each non-system step in the workflow. These templates:
- Follow the structure used in the DualEnroll application
- Incorporate step-specific configuration details (labels, options, etc.)
- Are pre-configured to use the proper completion state values 
- Need to be placed in the appropriate theme directory for your college

To install the view templates:
1. Copy the template files from the \`views\` directory to the corresponding paths in your DualEnroll instance
2. The templates are organized by role and step type
3. Customize the templates as needed to match your college's specific styling and functionality
` : '';
  
  return `# ${collegeName} Workflow Export

This archive contains the workflow definition files needed to implement the ${collegeName} workflow in DualEnroll.

## Files Included

### Main Fixture File
- \`${collegeVarName}_fixture.rb\` - Contains the college setup, ActiveFlowDefinitions, and ActiveFlowStepTriggers

### Initializer Classes
${workflowCategories.map(category => {
  const classNameSuffix = category.targetObject === 'StudentDeCourse' ? 'CourseRegistration' : category.targetObject;
  
  // Get the proper snake case suffix for the filename
  let snakeClassNameSuffix = '';
  if (classNameSuffix === 'CollegeStudentApplication') {
    snakeClassNameSuffix = 'college_student_application';
  } else if (classNameSuffix === 'CourseRegistration') {
    snakeClassNameSuffix = 'course_registration';
  } else if (classNameSuffix === 'StudentTerm') {
    snakeClassNameSuffix = 'student_term';
  } else {
    snakeClassNameSuffix = snakeCase(classNameSuffix);
  }
  
  const fileName = `initialize_${collegeVarName}_${snakeClassNameSuffix}_step.rb`;
  return `- \`initializers/${fileName}\` - Initializer for ${category.displayName} workflow`;
}).join('\n')}
${viewTemplatesSection}

## Installation Instructions

1. Copy the main fixture file to the \`db/fixtures\` directory in your DualEnroll instance
2. Copy the initializer classes to the \`app/models/steps/${collegeVarName}\` directory
   - Create this directory if it doesn't exist
   - The file naming follows the standard Rails convention (e.g., initialize_college_course_registration_step.rb)
   - Each file defines a class that matches the camelized file path (e.g., InitializeCollegeCourseRegistrationStep)
   - This ensures compatibility with Rails' autoloading system (Zeitwerk)
3. Copy the view templates to \`app/views/themes/${collegeVarName}/\` directory
   - Make sure to preserve the directory structure
   - Customize the templates as needed for your college's specific requirements
4. Run the seed data import:
   \`\`\`
   rails db:seed_fu
   \`\`\`

## Implementation Notes

- The initializer classes handle conditional logic to set appropriate fields in the workflow
- Each workflow branch sets completion states for steps that would be skipped in other scenarios
- Scenario conditions from the workflow builder have been translated to Ruby code in the initializers
- View templates are pre-configured to work with the completion states defined in the workflow steps

## Workflow Overview

This export implements the following workflow components:
${workflowCategories.map(category => {
  return `- ${category.displayName} (${category.targetObject})`
}).join('\n')}

## Understanding Soft Required Fields

The DualEnroll workflow system uses a "fields hash" to control the flow of steps. The initializer classes
automatically set fields for students based on conditions like:

- Whether they are home schooled
- Whether a course has prerequisites
- Whether parent consent is required
- And other workflow-specific conditions

This approach allows all students to eventually reach common endpoint steps in the workflow, regardless
of which conditional branches they follow.

## Document Types

Upload steps in this workflow use standard DualEnroll document types. The following document types are available:

- `transcript` - Student transcripts
- `test_scores` - Standardized test scores
- `additional_documentation` - Additional supporting documents
- `other` - Miscellaneous documents
- `consolidated_pdf` - Combined PDF documents
- `proof_of_identity` - Identity verification documents
- `orientation_certificate` - Orientation completion certificates
- `regional_center_form` - Regional center forms
- `immunization_form` - Immunization records
- `home_school_affidavit` - Home school affidavits
- `immigration_document` - Immigration documentation
- `green_card` - Green card documentation

These document types match the core DualEnroll system. When implementing custom upload steps, ensure that the document types match the expected values in the system.
`;
};

export default exportZipArchive;
