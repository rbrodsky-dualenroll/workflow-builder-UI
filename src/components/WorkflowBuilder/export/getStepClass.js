/**
 * Get the step class name based on step type
 * @param {Object} step - Step data from the workflow
 * @returns {string} - Step class name
 */
const getStepClass = (step) => {
  switch (step.stepType) {
    case 'Approval':
      return step.title === 'Parent Consent' ? 'ProvideConsentStep': 'ApprovalStep';
    case 'Upload':
      return 'UploadDocumentStep';
    case 'Information':
      return 'InfoStep';
    case 'ProvideConsent':
      return 'ProvideConsentStep';
    case 'CheckHolds':
      return 'CheckHoldsViaEthosApiStep';
    case 'RegisterViaApi':
      return 'RegisterViaEthosApiStep';
    case 'ResolveIssue':
      return 'ResolveIssueStep';
    case 'ReviewFailedRegistration':
      return 'ApprovalStep';
    case 'Registration Failure':
      return 'DeclineRegistrationStep';
    case 'Successful Registration':
      // Use CompleteRegistrationStep by default but allow override
      return step.step_class || 'CompleteRegistrationStep';
    default:
      return step.step_class || 'ApprovalStep';
  }
};

export default getStepClass;
