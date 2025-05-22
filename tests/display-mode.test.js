/**
 * Tests for the workflow display mode
 */
import { describe, test, expect, beforeAll } from '@jest/globals';
import { waitForTestId, clickByTestId } from './puppeteer-helpers.js';

describe('Display Mode', () => {
  beforeAll(async () => {
    await page.goto('http://localhost:5173/workflow-builder-UI/?test=true');
    await page.waitForSelector('body');
  });

  test('can toggle display mode', async () => {
    await waitForTestId(page, 'display-mode-toggle');
    await clickByTestId(page, 'display-mode-toggle');
    await waitForTestId(page, 'display-mode-container');
    const exists = await page.$('[data-testid="display-mode-container"]') !== null;
    expect(exists).toBe(true);

    // Exit display mode
    await clickByTestId(page, 'display-mode-toggle');
    try {
      await waitForTestId(page, 'workflow-steps-container');
    } catch {
      await waitForTestId(page, 'empty-workflow');
    }
  });
});
