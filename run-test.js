/**
 * Test runner for workflow builder functionality
 * 
 * To use this script:
 * 1. Start your development server with the test app: npm run dev
 * 2. Run this script: node run-test.js [testName]
 */

import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory (ES modules don't have __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the test script
// Choose which test to run
const testScript = process.argv[2] || 'feedbackGroupingTest';
const testScriptPath = path.join(__dirname, 'src', 'tests', `${testScript}.js`);

console.log('==================================');
console.log('Workflow Builder Test Runner');
console.log('==================================');
console.log(`\nRunning test: ${testScript}`);

const testDescriptions = {
  'feedbackGroupingTest': 'This test will verify that parent steps and their feedback\nchildren move together as a group when the parent is dragged.',
  'feedbackParentChildIDTest': 'This test will verify that parent-child relationships are\nmaintained when moving and editing workflow steps.'
};

if (testDescriptions[testScript]) {
  console.log(testDescriptions[testScript]);
}

console.log('\nMake sure your development server is running before proceeding.\n');

// Run the test script
console.log(`Running test script: ${testScriptPath}\n`);

const testProcess = exec(`node ${testScriptPath}`, { maxBuffer: 1024 * 1024 * 10 });

// Forward output from the test script
testProcess.stdout.on('data', (data) => {
  process.stdout.write(data);
});

testProcess.stderr.on('data', (data) => {
  process.stderr.write(data);
});

// Handle completion
testProcess.on('close', (code) => {
  console.log(`\nTest completed with exit code: ${code}`);
  
  if (code === 0) {
    console.log('\n✅ All tests PASSED!');
  } else {
    console.log('\n❌ Some tests FAILED!');
  }
  
  console.log('\nSee above for detailed test results.');
});
