# Workflow Builder Scenarios

This document explains how to use the Scenarios feature of the Workflow Builder application.

## What are Scenarios?

Scenarios are conditional branches of a workflow that get triggered based on specific conditions. For example, you might have a different set of steps for homeschool students compared to public school students, but they eventually merge back into the main workflow.

## Creating a New Scenario

1. In the Workflow Builder, click the "New Scenario" button in the Scenarios panel.
2. Enter a name for your scenario (e.g., "Homeschool Path").
3. Enter a condition that triggers this scenario (e.g., "student.homeSchool === true").
4. Select a base scenario - this is the starting point for your new scenario.
5. Click "Create" to create the scenario.

## Working with Scenarios

- **Switch between scenarios** by clicking on the scenario tabs. Only one scenario is active at a time for editing.
- **Add steps to a scenario** by clicking the "Add Step" button when the scenario is active.
- **Edit steps in a scenario** by clicking the Edit button on any step.
- **View the Master workflow** by clicking the "Master View" button - this shows all scenarios merged together.

## How Scenario Steps Work

When you edit a step in a scenario:

1. **In the main scenario**: Changes apply to all scenarios that haven't customized that step.
2. **In a conditional scenario**: A new conditional version of the step is created, only visible in that scenario.

This allows you to have shared steps across scenarios while still customizing specific steps for specific conditions.

## Visual Indicators

The Workflow Builder uses several visual indicators to help you understand scenarios:

- **Scenario tabs**: Each scenario has a tab with its name and condition.
- **Main scenario**: The main scenario has a special border to distinguish it.
- **Conditional steps**: In the Master View, conditional steps are indented and have a dashed border to show they're conditional.
- **Condition badges**: Steps that have conditions show their conditions as badges.

## Saving and Loading Workflows with Scenarios

When you save a workflow, all scenarios are saved together in the JSON file. When you load a workflow, all scenarios are restored.

## Best Practices

1. **Keep the main scenario focused** on the core workflow that most users will follow.
2. **Create scenarios for variants** of the workflow that have different requirements.
3. **Use clear, specific conditions** for scenarios to make it obvious when they apply.
4. **Review the Master View** to ensure the merged workflow makes logical sense.
5. **Use descriptive step titles** to make it clear which steps belong to which scenarios.

## Example Scenario: Home School Student Registration

In this example:

1. The main workflow handles registration for public school students.
2. A "Home School" scenario handles additional steps for home school students:
   - Parent uploads a home school affidavit
   - College reviews the affidavit
   - Parent provides additional documentation
   
Both paths merge back together for the final registration steps.
