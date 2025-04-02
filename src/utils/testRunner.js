/**
 * Test runner for the feedback loop grouping implementation
 * 
 * This file provides a way to run the tests from the browser console
 * to verify that the feedback loop grouping functionality works correctly.
 */

import { runAllTests } from './testFeedbackMoves';

// Add the test runner to the window object so it can be run from the console
window.testFeedbackGrouping = () => {
  console.log('Running feedback grouping tests...');
  const results = runAllTests();
  
  // Display overall test success/failure
  const allTestsPassed = Object.values(results).every(result => result.success);
  
  if (allTestsPassed) {
    console.log('%c All tests passed! ✅', 'color: green; font-weight: bold;');
  } else {
    console.log('%c Some tests failed! ❌', 'color: red; font-weight: bold;');
    
    // Log detailed results for failed tests
    Object.entries(results).forEach(([testName, result]) => {
      if (!result.success) {
        console.log(`%c Test "${testName}" failed:`, 'color: red;');
        console.log('Expected:', result.expected);
        console.log('Actual:', result.actual);
      }
    });
  }
  
  return results;
};

// Log instructions on how to run the tests
console.log(
  'Feedback grouping tests are available. To run them, open the browser console and type: window.testFeedbackGrouping()'
);
