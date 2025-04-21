/**
 * Feedback Soft Required Fields Test
 * 
 * This test validates that feedback steps are correctly generated with the proper
 * soft required fields pattern that matches the DualEnroll core application.
 */

import { generateRubyFixture } from '../components/WorkflowBuilder/export/rubyFixtureExporter';
import { generateUniqueId } from '../utils/idUtils';

// Test helper function to create a basic workflow with a parent step and feedback step
const createTestWorkflow = () => {
  // Create parent approval step
  const parentStepId = generateUniqueId('parent_');
  const parentStep = {
    id: parentStepId,
    title: "College Review",
    stepType: "Approval",
    role: "College",
    description: "College reviews the application",
    workflow_category: "Per Course",
    actionOptions: [
      { label: "Approve", value: "approve-yes" },
      { label: "Decline", value: "decline-no", terminates_workflow: true }
    ],
    feedbackLoops: {
      "feedback1": {
        recipient: "Student",
        nextStep: "Provide Additional Information"
      },
      "feedback2": {
        recipient: "High School",
        nextStep: "Provide High School Transcript"
      },
      "feedback3": {
        recipient: "Parent",
        nextStep: "Provide Parent Consent"
      }
    }
  };
  
  // Create feedback step for student
  const feedbackId1 = "feedback1";
  const feedbackStep1 = {
    id: generateUniqueId('feedback_'),
    title: "Provide Additional Information",
    stepType: "Upload",
    role: "Student",
    description: "Student provides additional information",
    isFeedbackStep: true,
    feedbackRelationship: {
      feedbackId: feedbackId1,
      parentStepId: parentStepId,
      parentStepTitle: "College Review",
      requestingRole: "College",
      recipientRole: "Student"
    },
    fileUploads: [
      { label: "Supporting Documentation", required: true }
    ],
    actionOptions: [
      { label: "Return to College", value: "return-to-college" }
    ],
    workflow_category: "Per Course"
  };
  
  // Create feedback step for high school
  const feedbackId2 = "feedback2";
  const feedbackStep2 = {
    id: generateUniqueId('feedback_'),
    title: "Provide High School Transcript",
    stepType: "Upload",
    role: "High School",
    description: "High School provides transcript",
    isFeedbackStep: true,
    feedbackRelationship: {
      feedbackId: feedbackId2,
      parentStepId: parentStepId,
      parentStepTitle: "College Review",
      requestingRole: "College",
      recipientRole: "High School"
    },
    fileUploads: [
      { label: "Transcript", required: true }
    ],
    actionOptions: [
      { label: "Return to College", value: "return-to-college" }
    ],
    workflow_category: "Per Course"
  };
  
  // Create test workflow data
  return {
    scenarios: {
      main: {
        steps: [parentStep, feedbackStep1, feedbackStep2]
      }
    },
    workflowName: "Test Workflow"
  };
};

// Test function
const testFeedbackSoftRequiredFields = () => {
  console.log("RUNNING FEEDBACK SOFT REQUIRED FIELDS TEST");
  
  // Create test data
  const workflowData = createTestWorkflow();
  
  // College data for the fixture generation
  const collegeData = {
    name: "Test College",
    id: "12345",
    city: "Test City",
    state: "TX",
    zip: "12345",
    phone: "1234567890",
    url: "www.testcollege.edu",
    type: "Public: 2-year"
  };
  
  // Generate the Ruby fixture
  const rubyFixture = generateRubyFixture(workflowData, collegeData);
  
  // Check for the expected patterns
  const checks = [
    // Check for student feedback soft required field
    {
      pattern: "college_review_student_more_info",
      description: "Student feedback soft required field"
    },
    // Check for high school feedback soft required field
    {
      pattern: "college_review_hs_more_info",
      description: "High School feedback soft required field"
    },
    // Check for clear states by completion
    {
      pattern: "'clear_states_by_completion' => {",
      description: "Clear states by completion present"
    },
    // Check for complete handling in clear_states_by_completion
    {
      pattern: "'complete' => [",
      description: "Complete handler in clear_states_by_completion"
    }
  ];
  
  // Run the checks
  let success = true;
  checks.forEach(check => {
    if (rubyFixture.includes(check.pattern)) {
      console.log(`✅ PASS: ${check.description}`);
    } else {
      console.log(`❌ FAIL: ${check.description} - Could not find pattern: ${check.pattern}`);
      success = false;
    }
  });
  
  // Output overall result
  if (success) {
    console.log("🎉 SUCCESS: All feedback soft required field checks passed!");
  } else {
    console.log("❌ FAILURE: Some feedback soft required field checks failed.");
    // Output a snippet of the Ruby fixture for debugging
    console.log("\nRuby fixture snippet:");
    console.log(rubyFixture.substring(0, 500) + "...");
  }
  
  return success;
};

// Run the test
testFeedbackSoftRequiredFields();

// Export for use in other test runners
export { testFeedbackSoftRequiredFields };
