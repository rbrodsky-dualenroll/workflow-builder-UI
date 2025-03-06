import { useState, useEffect } from 'react';
import { validateStep } from '../../utils/workflowUtils';

// Import all section components
import BaseStepSection from './sections/BaseStepSection';
import ConditionalSection from './sections/ConditionalSection';
import ApprovalStepSection from './sections/ApprovalStepSection';
import UploadStepSection from './sections/UploadStepSection';
import InformationStepSection from './sections/InformationStepSection';
import TableColumnsSection from './sections/TableColumnsSection';
import CrnDisplaySection from './sections/CrnDisplaySection';
import CommentsSection from './sections/CommentsSection';
import FeedbackLoopsSection from './sections/FeedbackLoopsSection';
import { 
  ProvideConsentSection, 
  CheckHoldsSection, 
  RegisterViaApiSection, 
  ResolveIssueSection 
} from './sections/SpecializedStepSections';

const StepForm = ({ initialData = {}, onSubmit, onCancel, scenarioId, scenarioCondition, onAddFeedbackStep }) => {
  // Display scenario info if in a scenario other than main
  const isConditionalScenario = scenarioId && scenarioId !== 'main';
  const scenarioInfo = isConditionalScenario ? { id: scenarioId, condition: scenarioCondition } : null;
  
  // Form errors
  const [errors, setErrors] = useState({});
  
  // Default action options for Approval steps
  const defaultApprovalOptions = [
    { label: 'Approve', value: 'approve-yes' },
    { label: 'Decline', value: 'decline-no' },
    { label: 'Defer', value: 'defer' }
  ];

  // Default form data
  const defaultFormData = {
    stepType: 'Approval',
    title: '',
    role: 'College',
    subworkflow: 'Per Course',
    description: '',
    conditional: false,
    triggeringCondition: '',
    actionOptions: [],
    fileUploads: [],
    informationDisplays: [],
    tableColumns: ['Student Name', 'Course Number', 'CRN', 'Instructor'],
    feedbackLoops: {},
    pendingFeedbackSteps: [], // Array to store pending feedback steps
    comments: {
      required: false,
      public: true
    },
    // CRN Display settings
    showCrnInfo: false,
    crnDisplay: [],
    // Fields for CheckHolds step
    holdCodes: '',
    // Fields for RegisterViaApi step
    apiEndpoint: '',
    // Fields for ProvideConsent step
    consentType: 'all',
    // Fields for ResolveIssue step
    issueType: '',
  };

  // Initialize form data with defaults and any provided initialData
  const [formData, setFormData] = useState(() => {
    const initialFormData = {
      ...defaultFormData,
      ...initialData
    };
    
    // Add default action options for new Approval steps
    if (
      (!initialData.id || !initialData.actionOptions || initialData.actionOptions.length === 0) && 
      (initialData.stepType === 'Approval' || !initialData.stepType)
    ) {
      initialFormData.actionOptions = [...defaultApprovalOptions];
    }
    
    return initialFormData;
  });

  // Effect for conditional scenarios
  useEffect(() => {
    // If we're in a conditional scenario, set the conditional flag by default for new steps
    if (isConditionalScenario && !initialData.id) {
      setFormData(prev => ({
        ...prev,
        conditional: true,
        triggeringCondition: scenarioCondition || ''
      }));
    }
  }, [isConditionalScenario, scenarioId, scenarioCondition, initialData]);

  // Effect to update form data when initialData changes
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        ...defaultFormData,
        ...initialData,
        pendingFeedbackSteps: [] // Always reset pending feedback steps
      });
    }
  }, [initialData]);

  // Handle changes to form fields
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // For step type changes, handle special cases
    if (name === 'stepType') {
      let updatedFormData = {
        ...formData,
        [name]: value,
        // Reset CRN display settings on step type change
        showCrnInfo: false,
        crnDisplay: []
      };
      
      // If changing step type to Approval and no action options exist, add defaults
      if (value === 'Approval' && (!formData.actionOptions || formData.actionOptions.length === 0)) {
        updatedFormData.actionOptions = [...defaultApprovalOptions];
      }
      
      // If changing to ProvideConsent, clear action options and other unnecessary fields
      if (value === 'ProvideConsent') {
        updatedFormData.actionOptions = [];
        updatedFormData.comments = {
          required: false,
          public: true
        };
      }
      
      setFormData(updatedFormData);
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate the form
    const validationErrors = validateStep(formData);
    
    if (Object.keys(validationErrors).length === 0) {
      // First submit the main step
      const stepData = { ...formData };
      
      // Remove the pendingFeedbackSteps array from main step data
      const pendingFeedbackSteps = [...(stepData.pendingFeedbackSteps || [])];
      delete stepData.pendingFeedbackSteps;
      
      // Submit the main step
      onSubmit(stepData);
      
      // Then submit each feedback step as an independent step
      if (onAddFeedbackStep && pendingFeedbackSteps.length > 0) {
        // Create all feedback steps as independent steps
        pendingFeedbackSteps.forEach(feedbackStep => {
          const uniqueFeedbackStep = { 
            ...feedbackStep,
            // Ensure a unique ID for each feedback step
            id: feedbackStep.id || `feedback_step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          };
          onAddFeedbackStep(uniqueFeedbackStep);
        });
      }
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {/* Base Step Information */}
      <BaseStepSection 
        formData={formData} 
        handleChange={handleChange} 
        errors={errors} 
      />

      {/* Conditional Logic */}
      <ConditionalSection 
        formData={formData} 
        handleChange={handleChange} 
        scenarioInfo={scenarioInfo}
        errors={errors} 
      />

      {/* Table Columns - not for Information or Consent steps */}
      {formData.stepType !== 'Information' && formData.stepType !== 'ProvideConsent' && (
        <>
          <TableColumnsSection 
            formData={formData} 
            setFormData={setFormData} 
            errors={errors} 
          />
          
          {/* CRN Display Settings - only shown when CRN column is present */}
          <CrnDisplaySection 
            formData={formData} 
            setFormData={setFormData} 
          />
        </>
      )}

      {/* Step-specific sections */}
      {formData.stepType === 'Approval' && (
        <ApprovalStepSection 
          formData={formData} 
          setFormData={setFormData} 
          errors={errors} 
        />
      )}

      {formData.stepType === 'Upload' && (
        <UploadStepSection 
          formData={formData} 
          setFormData={setFormData} 
          errors={errors} 
        />
      )}

      {formData.stepType === 'Information' && (
        <InformationStepSection 
          formData={formData} 
          setFormData={setFormData} 
          errors={errors} 
        />
      )}

      {formData.stepType === 'ProvideConsent' && (
        <ProvideConsentSection 
          formData={formData} 
          handleChange={handleChange} 
          errors={errors} 
        />
      )}

      {formData.stepType === 'CheckHolds' && (
        <CheckHoldsSection 
          formData={formData} 
          handleChange={handleChange} 
          errors={errors} 
        />
      )}

      {formData.stepType === 'RegisterViaApi' && (
        <RegisterViaApiSection 
          formData={formData} 
          handleChange={handleChange} 
          errors={errors} 
        />
      )}

      {formData.stepType === 'ResolveIssue' && (
        <ResolveIssueSection 
          formData={formData} 
          handleChange={handleChange} 
          errors={errors} 
        />
      )}

      {/* Feedback Loops - only for Approval steps */}
      {formData.stepType === 'Approval' && (
        <FeedbackLoopsSection 
          formData={formData} 
          setFormData={setFormData} 
          onAddFeedbackStep={onAddFeedbackStep}
        />
      )}

      {/* Comments Section - not for Consent steps */}
      {formData.stepType !== 'ProvideConsent' && (
        <CommentsSection 
          formData={formData} 
          setFormData={setFormData} 
          errors={errors} 
        />
      )}

      {/* Form Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <button 
          type="button" 
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
        >
          Cancel
        </button>
        <button 
          type="submit"
          className="px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded-md"
        >
          Save Step
        </button>
      </div>
    </form>
  );
};

export default StepForm;
