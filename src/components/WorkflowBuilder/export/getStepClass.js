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
      // Map to appropriate API integration based on configuration
      const holdsIntegration = step.holdsApiIntegration || 'ethos';
      switch (holdsIntegration) {
        case 'ethos': return 'CheckHoldsViaEthosApiStep';
        case 'banner': return 'CheckHoldsViaBannerApiStep';
        case 'colleague': return 'CheckHoldsViaColleagueApiStep';
        default: return 'CheckHoldsViaEthosApiStep';
      }
    case 'RegisterViaApi':
      // Map to appropriate SIS integration based on configuration
      const sisIntegration = step.sisIntegration || 'ethos';
      switch (sisIntegration) {
        case 'ethos': return 'RegisterViaEthosApiStep';
        case 'colleague': return 'RegisterViaColleagueWebApiStep';
        case 'banner_eedm': return 'RegisterViaBannerEedmApiStep';
        case 'banner_erp': return 'RegisterViaBannerErpApiStep';
        case 'jenzabar': return 'RegisterViaJenzabarApiStep';
        case 'peoplesoft': return 'RegisterViaPeopleSoftApiStep';
        case 'xml': return 'RegisterViaXmlStep';
        default: return 'RegisterViaEthosApiStep';
      }
    case 'ResolveIssue':
      return 'ResolveIssueStep';
    case 'ReviewFailedRegistration':
      return 'ApprovalStep';
    case 'Registration Failure':
      return 'DeclineRegistrationStep';
    case 'Successful Registration':
      // Use CompleteRegistrationStep by default but allow override
      return step.step_class || 'CompleteRegistrationStep';
    case 'PendingCompletionOfOneTimeSteps':
      return 'WaitForSubordinateRegistrationActiveFlowCompletionStep';
    case 'PendingCompletionOfPerTermSteps':
      return 'WaitForSubordinateRegistrationActiveFlowCompletionStep';
    case 'PendingCompletionOfPerYearSteps':
      return 'WaitForSubordinateRegistrationActiveFlowCompletionStep';
    case 'RegistrationEligibilityCheck':
      // Map to appropriate API integration based on configuration
      const eligibilityIntegration = step.apiIntegration || 'ethos';
      switch (eligibilityIntegration) {
        case 'ethos': return 'RegistrationEligibilityViaEthosApiStep';
        case 'banner': return 'RegistrationEligibilityViaBannerApiStep';
        case 'colleague': return 'RegistrationEligibilityViaColleagueApiStep';
        default: return 'RegistrationEligibilityViaEthosApiStep';
      }
    case 'StudentProgramsCheck':
      const programsIntegration = step.apiIntegration || 'ethos';
      switch (programsIntegration) {
        case 'ethos': return 'GetStudentProgramsViaEthosApiStep';
        case 'banner': return 'GetStudentProgramsViaBannerApiStep';
        default: return 'GetStudentProgramsViaEthosApiStep';
      }
    case 'CreateHolds':
      const createHoldsIntegration = step.apiIntegration || 'ethos';
      switch (createHoldsIntegration) {
        case 'ethos': return 'CreateHoldsViaEthosApiStep';
        case 'banner': return 'CreateHoldsViaBannerApiStep';
        default: return 'CreateHoldsViaEthosApiStep';
      }
    case 'DeleteHolds':
      const deleteHoldsIntegration = step.apiIntegration || 'ethos';
      switch (deleteHoldsIntegration) {
        case 'ethos': return 'DeleteHoldsViaEthosApiStep';
        case 'banner': return 'DeleteHoldsViaBannerApiStep';
        default: return 'DeleteHoldsViaEthosApiStep';
      }
    default:
      return step.step_class || 'ApprovalStep';
  }
};

export default getStepClass;
