/**
 * Test for feedback loop role synchronization
 * 
 * This test verifies that when a feedback step's role is changed, the parent step
 * correctly updates its feedback relationship information.
 */
import puppeteer from 'puppeteer';

(async () => {
  // Launch the browser with a visible window for debugging
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 800 }
  });
  
  const page = await browser.newPage();
  
  try {
    // Navigate to the application
    await page.goto('http://localhost:5173/');
    console.log('Navigated to workflow builder application');
    
    // Take initial screenshot
    await page.screenshot({ path: 'screenshots/01-initial-state.png' });
    
    // Add a parent step
    console.log('Creating parent step...');
    await page.click('[data-testid="add-step-button"]');
    await page.waitForSelector('[data-testid="field-title"]');
    await page.type('[data-testid="field-title"]', 'College Parent Step');
    await page.select('[data-testid="field-role"]', 'College');
    await page.click('[data-testid="modal-save-button"]');
    await page.screenshot({ path: 'screenshots/02-parent-step-added.png' });
    
    // Edit parent step to add a feedback loop
    console.log('Adding feedback loop...');
    await page.click('[data-action="edit-step"]');
    
    // Scroll to the feedback section
    await page.evaluate(() => {
      document.querySelector('[data-testid="modal-content"]').scrollTop = 1000;
    });
    
    // Expand the feedback section
    await page.waitForSelector('[data-testid="feedback-loops-section-header"]');
    await page.click('[data-testid="feedback-loops-section-header"]');
    
    // Add a feedback loop
    await page.waitForSelector('[data-testid="field-recipient"]');
    await page.select('[data-testid="field-recipient"]', 'Student');
    await page.type('[data-testid="field-nextStep"]', 'Student Feedback Step');
    await page.click('[data-testid="add-feedback-loop-button"]');
    await page.screenshot({ path: 'screenshots/03-feedback-added.png' });
    
    // Save the parent with feedback
    await page.click('[data-testid="modal-save-button"]');
    await page.screenshot({ path: 'screenshots/04-workflow-with-feedback.png' });
    
    // Now edit the feedback step
    console.log('Editing feedback step to change role...');
    const feedbackEditButton = await page.waitForSelector('[data-testid^="edit-step-"][data-for-step^="feedback_"]');
    await feedbackEditButton.click();
    
    // Change role from Student to High School
    await page.waitForSelector('[data-testid="field-role"]');
    await page.select('[data-testid="field-role"]', 'High School');
    
    // Save the updated feedback step
    await page.click('[data-testid="modal-save-button"]');
    await page.screenshot({ path: 'screenshots/05-feedback-role-changed.png' });
    
    // Now check if the parent step has the updated feedback information
    // Edit parent step
    console.log('Verifying parent step has updated feedback info...');
    const parentEditButton = await page.waitForSelector('[data-action="edit-step"]:not([data-for-step^="feedback_"])');
    await parentEditButton.click();
    
    // Scroll to feedback loops section again
    await page.evaluate(() => {
      document.querySelector('[data-testid="modal-content"]').scrollTop = 1000;
    });
    
    // Expand the feedback section
    await page.waitForSelector('[data-testid="feedback-loops-section-header"]');
    await page.click('[data-testid="feedback-loops-section-header"]');
    
    // Wait for the feedback loop to appear
    await page.waitForSelector('[data-testid^="feedback-loop-"]');
    
    // Verify the recipient in the parent's feedback section is updated to High School
    const feedbackRecipient = await page.evaluate(() => {
      const feedbackLoop = document.querySelector('[data-testid^="feedback-loop-"]');
      const recipientElement = feedbackLoop.querySelector('.text-primary.font-bold');
      return recipientElement ? recipientElement.textContent : null;
    });
    
    // Check if the recipient is now High School
    console.log(`Feedback recipient in parent step: ${feedbackRecipient}`);
    console.log(`Test ${feedbackRecipient === 'High School' ? 'PASSED' : 'FAILED'}`);
    
    // Take final screenshot
    await page.screenshot({ path: 'screenshots/06-parent-step-updated.png' });
    
    console.log('Test completed');
    
  } catch (error) {
    console.error('Test failed:', error);
    await page.screenshot({ path: 'screenshots/error.png' });
  } finally {
    // Close browser
    await browser.close();
  }
})();
