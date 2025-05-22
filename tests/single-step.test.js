import { describe, test, expect, beforeAll } from '@jest/globals';
import {
  waitForTestId,
  clickByTestId,
  typeIntoInput,
  takeScreenshot
} from './puppeteer-helpers.js';

let createdStepId = null;

describe('Single Step Functionality', () => {
  beforeAll(async () => {
    // Navigate to the app in test mode
    await page.goto('http://localhost:5173/workflow-builder-UI/?test=true');
    await waitForTestId(page, 'add-step-button');
  });

  test('can create a basic approval step', async () => {
    // Open the add step modal
    await clickByTestId(page, 'add-step-button');
    await waitForTestId(page, 'modal-content');

    // Fill out the minimal required fields
    await page.select('[data-testid="step-form-type"]', 'Approval');
    await typeIntoInput(page, 'step-form-title', 'My First Step');
    await page.select('[data-testid="field-role"]', 'High School');
    await page.select('[data-testid="field-workflow-category"]', 'Per Term');

    // Save the step
    await clickByTestId(page, 'modal-save-button');
    await page.waitForFunction(() => !document.querySelector('[data-testid="modal-backdrop"]'));

    // Verify a single workflow step exists
    const stepIds = await page.$$eval('[data-testid^="workflow-step-"]', els => els.map(el => el.getAttribute('data-step-id')));
    expect(stepIds.length).toBe(1);
    createdStepId = stepIds[0];

    // Confirm the header text contains the new title
    const headerText = await page.$eval(`[data-testid="step-header-${createdStepId}"]`, el => el.textContent);
    expect(headerText).toContain('My First Step');

    await takeScreenshot(page, 'single-step-created');
  });

  test('can edit the created step', async () => {
    // Open the edit modal for the created step
    await page.click(`[data-testid="edit-step-${createdStepId}"]`);
    await waitForTestId(page, 'modal-content');

    // Replace the title and change the role
    await page.click('[data-testid="step-form-title"]', { clickCount: 3 });
    await page.keyboard.press('Backspace');
    await typeIntoInput(page, 'step-form-title', 'Updated Step');
    await page.select('[data-testid="field-role"]', 'College');

    // Save the changes
    await clickByTestId(page, 'modal-save-button');
    await page.waitForFunction(() => !document.querySelector('[data-testid="modal-backdrop"]'));

    const headerText = await page.$eval(`[data-testid="step-header-${createdStepId}"]`, el => el.textContent);
    expect(headerText).toContain('Updated Step');
    expect(headerText).toContain('College');

    await takeScreenshot(page, 'single-step-updated');
  });
});
