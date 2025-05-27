import React from 'react';
import FormField from '../../common/FormField';
import Card from '../../common/Card';
import ReviewFailedRegistrationSection from './ReviewFailedRegistrationSection';

/**
 * Section for the Provide Consent step type
 */
export const ProvideConsentSection = ({ formData, handleChange, errors = {} }) => {
  return (
    <Card title="Consent Step" className="bg-white mb-6">
      <div className="bg-gray-50 p-3 rounded-md border border-gray-300 mb-4">
        <p className="text-sm text-gray-700">This step will require the parent or guardian to provide consent for the student's enrollment.</p>
        <p className="text-sm text-gray-700 mt-2">Standard consent templates will be generated that are compatible with all workflow contexts.</p>
      </div>
      
      <FormField
        label="Consent Type"
        name="consentType"
        type="select"
        value={formData.consentType || 'all'}
        onChange={handleChange}
        options={[
          { value: 'all', label: 'All (Generic Consent)' },
          { value: 'ferpa', label: 'FERPA' },
          { value: 'financial', label: 'Financial Responsibility' },
        ]}        
        error={errors.consentType}
      />
    </Card>
  );
};

/**
 * Section for the Review Failed Registration step type
 */
export const ReviewFailedRegistrationStepSection = ReviewFailedRegistrationSection;

/**
 * Section for the Check Holds step type
 */
export const CheckHoldsSection = ({ formData, handleChange, errors = {} }) => {
  return (
    <Card title="Hold Check Configuration" className="bg-white mb-6">
      <FormField
        label="SIS Integration"
        name="holdsApiIntegration"
        type="select"
        value={formData.holdsApiIntegration || 'ethos'}
        onChange={handleChange}
        options={[
          { value: 'ethos', label: 'Ethos API' },
          { value: 'banner', label: 'Banner API' },
          { value: 'colleague', label: 'Colleague API' },
        ]}
        error={errors.holdsApiIntegration}
      />
      
      <FormField
        label="Hold Codes (comma separated or *any*)"
        name="holdCodes"
        type="text"
        value={formData.holdCodes || ''}
        onChange={handleChange}
        placeholder="e.g., ORIEN, FINAID, ADVISING or *any*"
        error={errors.holdCodes}
        helpText="Specify which hold codes to check for, or use *any* to check for any holds"
      />
      
      <div className="bg-gray-50 p-3 rounded-md border border-gray-300 mt-4">
        <p className="text-sm text-gray-700">
          This step will check for holds on the student's account via the selected API integration.
          The workflow will branch based on whether holds are found.
        </p>
        <p className="text-sm text-gray-700 mt-2">
          <strong>Selected:</strong> {formData.holdsApiIntegration === 'ethos' ? 'Ethos API' : 
                                    formData.holdsApiIntegration === 'banner' ? 'Banner API' :
                                    formData.holdsApiIntegration === 'colleague' ? 'Colleague API' : 'Ethos API'}
        </p>
      </div>
    </Card>
  );
};

/**
 * Section for the Register Via API step type
 */
export const RegisterViaApiSection = ({ formData, handleChange, errors = {} }) => {
  return (
    <Card title="Register Via API" className="bg-white mb-6">
      <FormField
        label="SIS Integration"
        name="sisIntegration"
        type="select"
        value={formData.sisIntegration || 'ethos'}
        onChange={handleChange}
        options={[
          { value: 'ethos', label: 'Ethos API (Colleague/Banner via Ethos)' },
          { value: 'colleague', label: 'Colleague Web API' },
          { value: 'banner_eedm', label: 'Banner EEDM API' },
          { value: 'banner_erp', label: 'Banner ERP API' },
          { value: 'jenzabar', label: 'Jenzabar API' },
          { value: 'peoplesoft', label: 'PeopleSoft API' },
          { value: 'xml', label: 'XML Data Exchange' },
        ]}
        error={errors.sisIntegration}
      />
      
      <FormField
        label="Registration Action"
        name="registrationAction"
        type="select"
        value={formData.registrationAction || 'add'}
        onChange={handleChange}
        options={[
          { value: 'add', label: 'Add (Register)' },
          { value: 'drop', label: 'Drop' },
          { value: 'withdraw', label: 'Withdraw' },
        ]}
        error={errors.registrationAction}
      />
      
      {formData.sisIntegration === 'banner_eedm' && (
        <FormField
          label="Override Code (Optional)"
          name="overrideCode"
          type="text"
          value={formData.overrideCode || ''}
          onChange={handleChange}
          placeholder="e.g., DUAL"
          error={errors.overrideCode}
          helpText="Banner permit override code to use during registration"
        />
      )}
      
      {formData.sisIntegration === 'colleague' && (
        <FormField
          label="Check Course Section Roster"
          name="checkRoster"
          type="checkbox"
          checked={formData.checkRoster || false}
          onChange={handleChange}
          helpText="Verify student appears on course section roster after registration"
        />
      )}
      
      <div className="bg-gray-50 p-3 rounded-md border border-gray-300 mt-4">
        <p className="text-sm text-gray-700">
          This step will automatically register the student via the selected SIS integration.
          The system will handle all communication with your SIS and provide appropriate error handling.
        </p>
        <p className="text-sm text-gray-700 mt-2">
          <strong>Selected:</strong> {formData.sisIntegration === 'ethos' ? 'Ethos API' : 
                                    formData.sisIntegration === 'colleague' ? 'Colleague Web API' :
                                    formData.sisIntegration === 'banner_eedm' ? 'Banner EEDM API' :
                                    formData.sisIntegration === 'banner_erp' ? 'Banner ERP API' :
                                    formData.sisIntegration === 'jenzabar' ? 'Jenzabar API' :
                                    formData.sisIntegration === 'peoplesoft' ? 'PeopleSoft API' :
                                    formData.sisIntegration === 'xml' ? 'XML Data Exchange' : 'Ethos API'}
        </p>
      </div>
    </Card>
  );
};

/**
 * Section for the Resolve Issue step type
 */
export const ResolveIssueSection = ({ formData, handleChange, errors = {} }) => {
  return (
    <Card title="Issue Resolution Configuration" className="bg-white mb-6">
      <FormField
        label="Issue Type"
        name="issueType"
        type="select"
        value={formData.issueType || ''}
        onChange={handleChange}
        options={[
          { value: '', label: 'Select an issue type' },
          { value: 'RegistrationIssue', label: 'Registration Issue' },
          { value: 'PaymentIssue', label: 'Payment Issue' },
          { value: 'PrerequisiteIssue', label: 'Prerequisite Issue' },
          { value: 'HoldIssue', label: 'Hold Issue' },
          { value: 'Other', label: 'Other Issue' },
        ]}
        error={errors.issueType}
      />
      
      <div className="bg-gray-50 p-3 rounded-md border border-gray-300 mt-4">
        <p className="text-sm text-gray-700">This step allows the specified role to resolve issues that have occurred during the workflow process.</p>
      </div>
      
      {formData.fileUploads?.length === 0 && (
        <p className="text-xs text-gray-500 italic mt-4">Consider adding file uploads if supporting documents are needed to resolve the issue.</p>
      )}
    </Card>
  );
};

/**
 * Section for the PendingCompletionOfOneTimeSteps step type
 */
export const PendingCompletionOfOneTimeStepsSection = ({ formData, handleChange, errors = {} }) => {
  return (
    <Card title="Pending Completion Of One-Time Steps" className="bg-white mb-6">
      <div className="bg-gray-50 p-3 rounded-md border border-gray-300">
        <p className="text-sm text-gray-700">This step will automatically wait for the completion of the student's one-time application steps before proceeding. No configuration is required.</p>
        <p className="text-sm text-gray-700 mt-2">The system will handle this check automatically and proceed once the one-time steps are complete.</p>
      </div>
    </Card>
  );
};

/**
 * Section for the PendingCompletionOfPerTermSteps step type
 */
export const PendingCompletionOfPerTermStepsSection = ({ formData, handleChange, errors = {} }) => {
  return (
    <Card title="Pending Completion Of Per-Term Steps" className="bg-white mb-6">
      <div className="bg-gray-50 p-3 rounded-md border border-gray-300">
        <p className="text-sm text-gray-700">This step will automatically wait for the completion of the student's per-term steps before proceeding. No configuration is required.</p>
        <p className="text-sm text-gray-700 mt-2">The system will handle this check automatically and proceed once the per-term steps are complete.</p>
      </div>
    </Card>
  );
};

/**
 * Section for the PendingCompletionOfPerYearSteps step type
 */
export const PendingCompletionOfPerYearStepsSection = ({ formData, handleChange, errors = {} }) => {
  return (
    <Card title="Pending Completion Of Per-Year Steps" className="bg-white mb-6">
      <div className="bg-gray-50 p-3 rounded-md border border-gray-300">
        <p className="text-sm text-gray-700">This step will automatically wait for the completion of the student's per-year steps before proceeding. No configuration is required.</p>
        <p className="text-sm text-gray-700 mt-2">The system will handle this check automatically and proceed once the per-year steps are complete.</p>
      </div>
    </Card>
  );
};

/**
 * Section for general API Request step types
 */
export const APIRequestSection = ({ formData, handleChange, errors = {} }) => {
  const getApiOptions = () => {
    const stepType = formData.stepType;
    
    switch (stepType) {
      case 'RegistrationEligibilityCheck':
        return [
          { value: 'ethos', label: 'Ethos API' },
          { value: 'banner', label: 'Banner API' },
          { value: 'colleague', label: 'Colleague API' },
        ];
      case 'StudentProgramsCheck':
        return [
          { value: 'ethos', label: 'Ethos API' },
          { value: 'banner', label: 'Banner API' },
        ];
      case 'CreateHolds':
      case 'DeleteHolds':
        return [
          { value: 'ethos', label: 'Ethos API' },
          { value: 'banner', label: 'Banner API' },
        ];
      default:
        return [
          { value: 'ethos', label: 'Ethos API' },
          { value: 'banner', label: 'Banner API' },
          { value: 'colleague', label: 'Colleague API' },
        ];
    }
  };
  
  const getStepDescription = () => {
    const stepType = formData.stepType;
    
    switch (stepType) {
      case 'RegistrationEligibilityCheck':
        return 'This step will check if the student is eligible to register for courses via the selected SIS integration.';
      case 'StudentProgramsCheck':
        return 'This step will retrieve and validate the student\'s academic programs via the selected SIS integration.';
      case 'CreateHolds':
        return 'This step will create holds on the student\'s account via the selected SIS integration.';
      case 'DeleteHolds':
        return 'This step will remove holds from the student\'s account via the selected SIS integration.';
      default:
        return 'This step will perform an API request via the selected SIS integration.';
    }
  };
  
  return (
    <Card title={`${formData.stepType} Configuration`} className="bg-white mb-6">
      <FormField
        label="SIS Integration"
        name="apiIntegration"
        type="select"
        value={formData.apiIntegration || 'ethos'}
        onChange={handleChange}
        options={getApiOptions()}
        error={errors.apiIntegration}
      />
      
      {(formData.stepType === 'CreateHolds' || formData.stepType === 'DeleteHolds') && (
        <FormField
          label="Hold Codes (comma separated)"
          name="holdCodes"
          type="text"
          value={formData.holdCodes || ''}
          onChange={handleChange}
          placeholder="e.g., ORIEN, FINAID, ADVISING"
          error={errors.holdCodes}
          helpText="Specify which hold codes to create or remove"
        />
      )}
      
      <div className="bg-gray-50 p-3 rounded-md border border-gray-300 mt-4">
        <p className="text-sm text-gray-700">
          {getStepDescription()}
        </p>
        <p className="text-sm text-gray-700 mt-2">
          <strong>Selected:</strong> {formData.apiIntegration === 'ethos' ? 'Ethos API' : 
                                    formData.apiIntegration === 'banner' ? 'Banner API' :
                                    formData.apiIntegration === 'colleague' ? 'Colleague API' : 'Ethos API'}
        </p>
      </div>
    </Card>
  );
};
