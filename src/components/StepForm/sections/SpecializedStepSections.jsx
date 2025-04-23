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
          { value: 'custom', label: 'Custom' },
        ]}
        error={errors.consentType}
      />
      
    </Card>
  );
};

/**
 * Section for the Check Holds step type
 */
export const CheckHoldsSection = ({ formData, handleChange, errors = {} }) => {
  return (
    <Card title="Hold Check Configuration" className="bg-white mb-6">
      <FormField
        label="Hold Codes (comma separated or *any*)"
        name="holdCodes"
        type="text"
        value={formData.holdCodes || ''}
        onChange={handleChange}
        placeholder="e.g., ORIEN, FINAID, ADVISING or *any*"
        error={errors.holdCodes}
      />
      
      <div className="bg-gray-50 p-3 rounded-md border border-gray-300 mt-4">
        <p className="text-sm text-gray-700">This step will check for holds on the student's account. You can specify which hold codes to check for, or use *any* to check for any holds.</p>
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
      <div className="bg-gray-50 p-3 rounded-md border border-gray-300">
        <p className="text-sm text-gray-700">This step will automatically register the student via the DualEnroll API integration with your SIS. No configuration is required.</p>
        <p className="text-sm text-gray-700 mt-2">The system will handle all communication with your SIS and will provide appropriate messages for any errors encountered.</p>
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
 * Section for the Review Failed Registration step type
 */
export const ReviewFailedRegistrationStepSection = ReviewFailedRegistrationSection;
