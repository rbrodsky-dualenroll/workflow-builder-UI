/**
 * Fixture Generators
 * Index file for exporting all fixture generator components
 */

// Export all components from categorization.js
export { 
  categorizeWorkflowSteps,
  generateVersionNumbers,
  identifyWorkflowCategories
} from './categorization';

// Export all components from collegeSetup.js
export {
  generateFileHeader,
  generateCollegeSetup
} from './collegeSetup';

// Export all components from activeFlowDefinition.js
export {
  generateActiveFlowDefinition,
  generateStepsForCategory
} from './activeFlowDefinition';

// Export all components from stepGenerator.js
export {
  generateStepForCategory,
  extractCategoryName,
  isInitializationStep,
  isWaitingStep,
  createInitializationStep,
  createWaitForOneTimeCompletionStep,
  createWaitForPerTermCompletionStep,
  createCompleteOneTimeWorkflowStep,
  createFailedOneTimeWorkflowStep,
  createCompletePerTermWorkflowStep,
  createDeclinePerTermWorkflowStep
} from './stepGenerator';

// Export all components from normalization.js
export {
  normalizeStepNames,
  normalizeParticipantRoles
} from './normalization';
