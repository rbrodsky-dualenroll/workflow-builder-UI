# Form Elements Documentation

This directory contains documentation for the various form elements and sections in the Workflow Builder application.

## Available Documentation

| File | Description |
|------|-------------|
| [conditionals.md](./conditionals.md) | Complete documentation for conditional form elements in both step forms and scenario forms |
| [table_columns.md](./table_columns.md) | Documentation for table column configuration elements |
| [crn_display.md](./crn_display.md) | Documentation for CRN display options |
| [other_form_sections.md](./other_form_sections.md) | Documentation for additional form sections including: <br>- Button options form sections<br>- Comment fields configuration<br>- Document upload options<br>- Email notification settings<br>- Custom fields configuration<br>- Step visibility options<br>- Any other specialized form sections |

## Common Form Patterns

When working with form sections in the Workflow Builder:

1. **Expandable Sections**: Most form sections are expandable/collapsible. Always expand a section before attempting to interact with its contents.
2. **Wait for Content**: After expanding a section, wait for its content to become visible.
3. **Data Attributes**: All form elements have appropriate data-testid attributes for selection.
4. **Form Section Structure**: Most form sections follow a standard pattern:
   - Section container: `[data-testid="section-name-section"]`
   - Section header: `[data-testid="section-name-section-header"]`
   - Section expander: `[data-testid="section-name-section-expander"]`
   - Section content: `[data-testid="section-name-section-content"]`

## Form Interactions

### Opening Form Sections
```javascript
// Generic pattern for opening any form section
await page.click('[data-testid="section-name-section-expander"]');
await page.waitForSelector('[data-testid="section-name-section-content"]');
```

### Dropdown Selection

When selecting options from dropdowns, always use the exact value from the "Value" column in the relevant documentation tables. Do not use kebab-case or snake_case variants.

```javascript
// When selecting from dropdowns, use the exact value from the documentation
await page.select('[data-testid="some-dropdown-select"]', 'ExactValue');
```

## Common Issues and Troubleshooting

1. **Hidden Elements**: Some form elements may be hidden until certain conditions are met. Always verify that elements are visible before interacting with them.
2. **Stale References**: After making changes to the form, elements might be removed from the DOM and re-added. Always get fresh references to elements after form interactions.
3. **Timing Issues**: Allow sufficient time for form sections to expand or collapse before interacting with their contents. Use `page.waitForSelector()` or `page.waitForTimeout()` as needed.

## Best Practices

1. Always take screenshots to verify the state of forms during testing
2. Verify that form elements are visible before interacting with them
3. Always expand sections before attempting to interact with their contents
4. After making changes, verify that they were applied correctly
5. Use consistent selectors as documented in the relevant files
6. For dropdown selections, always use the exact value from the "Value" column in the documentation
