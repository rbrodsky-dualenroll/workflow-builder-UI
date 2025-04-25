# Table Columns in the Workflow Builder

This document explains how table columns work in the Workflow Builder and how they are used to generate view templates in the DualEnroll application.

## Overview

Table columns define what information is displayed in data tables within steps, particularly approval steps. The column configuration directly impacts:

1. What data is displayed in the UI
2. How the data is retrieved from DualEnroll's Ruby models in the generated view templates

## Standard Columns

The Workflow Builder provides a set of standard column types that map to common data elements in the DualEnroll system. These include:

| Display Label | Field Value | Description |
|---------------|-------------|-------------|
| Student Name | target.student.display_name | The student's full name |
| Course Number | course.number | The course number/identifier |
| Course Title | course.title | The course title |
| CRN | course_section.number | The course reference number |
| Section | course_section.section_number | The section identifier |
| Instructor | course_section.instructor.name | The instructor's name |
| Term | term.name | The term name |
| Credits | course.credits | The number of credits for the course |
| Status | registration_status | The registration status |
| High School | target.high_school.name | The high school name |
| Hold Names | fields.hold_names | Names of any holds on the student |
| Messages | fields.messages | System messages |
| Fee Amount | fee.pretty_fee_amount | The formatted fee amount |
| Payment Status | fields.payment_status | The payment status |
| Grade | fields.grade | The student's grade |
| Student Email | target.student.email | The student's email address |
| Student Phone | target.student.phone | The student's phone number |

## Custom Columns

In addition to standard columns, you can create custom columns:

1. Select "Custom Field" from the dropdown
2. Enter a display label (what will show in the UI)
3. Optionally, specify a Ruby code accessor (the Ruby code used to retrieve the data)

If you don't specify a Ruby code accessor, the generated template will include a placeholder comment.

## Generated View Templates

In the generated view templates, columns are translated into ERB code that retrieves data from the appropriate models:

```erb
<td><%= @target.student&.display_name %></td>
```

For nested objects, safe navigation operators (`&.`) are used to avoid nil errors:

```erb
<td><%= @course_section&.instructor&.name %></td>
```

## Best Practices

1. **Use standard columns when possible** - These are pre-configured to work correctly with DualEnroll's data models.

2. **For custom fields, provide the correct Ruby accessor** - Make sure the Ruby code path is valid and accessible in the view context.

3. **Keep field values consistent with DualEnroll models** - The field values must match the actual Ruby model structure in the DualEnroll application.

4. **Test your templates** - After generating and installing templates, verify that all data displays correctly in different scenarios.
