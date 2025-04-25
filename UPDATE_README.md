# Workflow Builder Updates

## Overview

This update introduces two significant improvements to the Workflow Builder:

1. **Standardized Document Types**: Document type selection is now limited to a predefined list that matches the core DualEnroll application.
2. **Enhanced Table Columns**: Table columns now use a structured format with predefined field accessors that correctly map to DualEnroll's Ruby models.

These changes ensure that workflows created with the Workflow Builder are more consistent with the core application and generate more reliable view templates.

## Document Types Update

### Changes Made

1. Updated the `UploadStepSection` component to:
   - Add a constant array of document types from the `StudentDocument.Kinds` class in DualEnroll
   - Replace the free-text input with a dropdown selection
   - Ensure document types are consistent with the core application

### Benefits

- Ensures document types in the workflow match valid types in the DualEnroll system
- Prevents typos and inconsistencies
- Makes the workflow export more reliable

### Standard Document Types

The following document types are now available:

- Transcript
- Test Scores
- Additional Documentation
- Other
- Consolidated PDF
- Proof of Identity
- Orientation Certificate
- Regional Center Form
- Immunization Form
- Home School Affidavit
- Immigration Document
- Green Card

## Table Columns Update

### Changes Made

1. Updated the `TableColumnsSection` component to:
   - Replace the "common columns" badges with a dropdown selection
   - Add structured mapping between display names and Ruby model accessors
   - Add support for custom columns with user-defined Ruby code accessors
   - Improve the code generation for view templates

2. Updated the approval template generator to:
   - Use the field accessors directly from the column configuration
   - Handle nested object paths correctly with safe navigation operators
   - Support custom Ruby code accessors for specialized use cases

### Benefits

- More reliable view templates that correctly access data from DualEnroll models
- Better consistency between the workflow definition and the generated code
- Support for custom data accessors while maintaining standardization

### Standard Table Columns

The following table columns are now available with proper field accessors:

- Student Name → target.student.display_name
- Course Number → course.number
- Course Title → course.title
- CRN → course_section.number
- Section → course_section.section_number
- Instructor → course_section.instructor.name
- Term → term.name
- Credits → course.credits
- Status → registration_status
- High School → target.high_school.name
- And many more...

## Documentation

- Added `docs/table_columns_documentation.md` with details on table column usage and field accessors
- Updated the README export to include information about document types

## Migrating Existing Workflows

Existing workflows will automatically be migrated to the new format when they are loaded. The migration process:

1. For document types, existing values will be matched to standard types when possible
2. For table columns, string values will be converted to structured objects with proper field accessors

## Getting Started

To use these new features:

1. For document types, simply select from the dropdown when configuring an Upload step
2. For table columns, choose from the standard columns dropdown or create a custom column with a specific Ruby accessor

For more information, refer to the documentation in the docs directory.
