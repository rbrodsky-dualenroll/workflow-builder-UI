# Workflow Builder - Puppeteer Testing Documentation

This documentation provides a comprehensive reference for using Puppeteer to test the Workflow Builder application. All components have been updated with consistent data attributes to make testing more reliable and maintainable.

## Key Principles

1. **Always use data-testid attributes**: Never use CSS selectors or XPath. All elements should have a proper data-testid attribute.
2. **Be descriptive**: Data attribute names should clearly indicate what the element is and its function.
3. **Be consistent**: Follow established naming patterns for similar components.
4. **Add missing attributes**: If you find an element that cannot be selected with a data-testid attribute, add the attribute to the component and document it here.

## Key Data Attributes

The application uses several types of data attributes for testing:

- `data-testid`: Unique identifiers for elements, often combining the element type and an ID
- `data-action`: The action a button or control performs
- `data-for-step`: Which step a control is associated with
- `data-step-id`: The unique ID of a workflow step
- `data-is-feedback`: Whether a step is a feedback step (true/false)
- `data-has-feedback`: Whether a step has feedback children (true/false)
- `data-parent-id`: For feedback steps, the ID of their parent step

## Documentation Files

This documentation is organized into component-specific files to make it easier to find relevant information:

| File | Description |
|------|-------------|
| [main_ui.md](./main_ui.md) | Main UI elements, including workflow management buttons and containers |
| [workflow_steps.md](./workflow_steps.md) | Step elements, controls, and interactions like drag and drop |
| [modals.md](./modals.md) | Modal dialogs, including confirmation dialogs and generic modal controls |
| [step_form.md](./step_form.md) | Step creation/editing form, fields, and options |
| [scenarios.md](./scenarios.md) | Scenario management, conditions, and tab controls |
| [scenario_specific_overrides.md](./workflow_scenarios/scenario_specific_overrides.md) | Scenario-specific step overrides and testing |
| [form_sections.md](./form_sections.md) | Collapsible form sections (conditionals, table columns, etc.) |
| [file_uploads.md](./file_uploads.md) | File upload controls and interactions |
| [feedback_loops.md](./feedback_loops.md) | Feedback loop creation and management |
| [common_patterns.md](./common_patterns.md) | Common testing patterns and helper functions |
| [troubleshooting.md](./troubleshooting.md) | Troubleshooting tips and known issues |

## Best Practices for Puppeteer Testing

1. **Use data attributes**: Always use data attributes (not CSS selectors) for selecting elements
2. **Wait for elements**: Always wait for elements to appear before interacting with them
3. **Validate step properties**: Check data attributes to validate step properties
4. **Use proper timeouts**: Allow time for animations and UI updates
5. **Test with real scenarios**: Test common user flows like adding, editing, and moving steps
6. **Use exact values for select options**: When using `page.select()`, always use the exact text value with proper spacing and capitalization, not kebab-case or snake_case variants
7. **Take screenshots**: Take screenshots at key points to debug visual issues
8. **Check the console**: Monitor browser console for JavaScript errors

## Adding New Components

When adding new components to the application:

1. Add appropriate data-testid attributes to all interactive elements
2. Document the attributes in the relevant documentation file
3. Add examples of how to interact with the component using Puppeteer
4. Update tests to cover the new component

## Getting Started

The application is available locally at [localhost:5173](http://localhost:5173). Navigate to this URL to begin testing.

For a quick start, see [common_patterns.md](./common_patterns.md) for basic examples of common testing tasks.
