import { useState, useEffect } from 'react';
import { validateStep, canStepTerminateWorkflow } from '../../utils/workflowUtils';

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
  ResolveIssueSection,
  ReviewFailedRegistrationStepSection,
  PendingCompletionOfOneTimeStepsSection,
  PendingCompletionOfPerTermStepsSection,
  PendingCompletionOfPerYearStepsSection
} from './sections/SpecializedStepSections';

const StepForm = ({ initialData = {}, onSubmit, onCancel, onAddFeedbackStep, workflowConditions = {}, onManageWorkflowConditions }) => {
  // Form errors
  const [errors, setErrors] = useState({});
  
  // Default form data
  const defaultFormData = {
    stepType: 'Approval',
    title: '',
    role: 'College',
    workflow_category: 'Per Course', // Updated from subworkflow
    description: '',
    conditional: false,
    workflowCondition: [],
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
    holdsApiIntegration: 'ethos',
    // Fields for RegisterViaApi step
    apiEndpoint: '',
    sisIntegration: 'ethos',
    registrationAction: 'add',
    overrideCode: '',
    checkRoster: false,
    // Fields for ProvideConsent step
    consentType: 'all',
    // Fields for ResolveIssue step
    issueType: '',
    // Fields for Upload step
    documentClass: 'StudentDocument',
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
      initialFormData.actionOptions = [
        { label: 'Approve', value: 'yes', canTerminate: false, terminates_workflow: false },
        { label: 'Decline', value: 'no', canTerminate: true, terminates_workflow: true },
        { label: 'Defer', value: 'defer', canTerminate: false, terminates_workflow: false }
      ];
      
      // Since we have a Decline option that terminates the workflow, ensure canTerminate is set
      initialFormData.canTerminate = true;
      
      // And ensure comments are required
      initialFormData.comments = { ...initialFormData.comments, required: true };
    }
    
    // Handle migration from subworkflow to workflow_category
    if (initialFormData.subworkflow && !initialFormData.workflow_category) {
      // Map old subworkflow values to new workflow_category values
      const mappings = {
        'Once Ever': 'One Time',
        'Per Year': 'Per Academic Year',
        'Per Term': 'Per Term',
        'Per Course': 'Per Course'
      };
      initialFormData.workflow_category = mappings[initialFormData.subworkflow] || 'Per Course';
      delete initialFormData.subworkflow; // Remove the old property
    }
    
    // Ensure conditional is properly initialized as a boolean
    initialFormData.conditional = Boolean(initialFormData.conditional);
    
    return initialFormData;
  });

  // Effect to update form data when initialData changes
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      // Create a new form data object from initial data
      const newFormData = {
        ...defaultFormData,
        ...initialData,
        pendingFeedbackSteps: [] // Always reset pending feedback steps
      };
      
      // Enforce System role for RegisterViaApi steps
      if (newFormData.stepType === 'RegisterViaApi') {
        newFormData.role = 'System';
      }
      
      // Force a re-render by creating a brand new object
      setFormData(newFormData);
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
        // Default Approve and Defer options don't terminate, but Decline always does
        updatedFormData.actionOptions = [
          { label: 'Approve', value: 'approve-yes', canTerminate: false, terminates_workflow: false },
          { label: 'Decline', value: 'no', canTerminate: true, terminates_workflow: true },
          { label: 'Defer', value: 'defer', canTerminate: false, terminates_workflow: false }
        ];
        
        // Since Decline terminates the workflow, ensure comments are required
        updatedFormData.comments = { ...updatedFormData.comments, required: true };
        // Set canTerminate at the step level based on action options
        updatedFormData.canTerminate = true;
      }
      
      // If changing to ProvideConsent, clear action options and other unnecessary fields
      if (value === 'ProvideConsent') {
        updatedFormData.actionOptions = [];
        updatedFormData.comments = {
          required: false,
          public: true
        };
      }
      
      // If changing to RegisterViaApi or a Pending Step, set role to System
      if (value === 'RegisterViaApi' || 
          value === 'PendingCompletionOfOneTimeSteps' || 
          value === 'PendingCompletionOfPerTermSteps' || 
          value === 'PendingCompletionOfPerYearSteps') {
        updatedFormData.role = 'System';
        
        // For Pending steps, automatically set the title to match the step type
        if (value.includes('Pending')) {
          updatedFormData.title = value;
        }
      }
      
      // If changing to ReviewFailedRegistration, set role to College by default
      if (value === 'ReviewFailedRegistration') {
        updatedFormData.role = 'College';
        updatedFormData.title = 'Review Failed Registration';
      }
      
      setFormData(updatedFormData);
    } else if (name === 'conditional') {
      // Special handling for conditional checkbox
      console.log('Setting conditional to:', checked);
      console.log('Previous form data:', formData);
      
      // Create completely new object to ensure state update
      const updatedFormData = {
        ...formData,
        conditional: checked
      };
      
      // If unchecking, also clear related fields
      if (!checked) {
        updatedFormData.workflowCondition = [];
      }
      
      console.log('Updated form data:', updatedFormData);
      // Force a re-render by creating a brand new object
      setFormData({...updatedFormData});
    } else if (name === 'role') {
      // Handle role changes
      if (formData.stepType === 'RegisterViaApi') {
        // For RegisterViaApi steps, always enforce System role regardless of selection
        setFormData(prev => ({
          ...prev,
          role: 'System'
        }));
        return;
      }

      let updatedFormData = { ...formData, role: value };

      // Automatically apply high_school condition for High School role steps
      if (value === 'High School') {
        updatedFormData.conditional = true;
        if (!updatedFormData.workflowCondition.includes('high_school')) {
          updatedFormData.workflowCondition = [
            ...updatedFormData.workflowCondition,
            'high_school'
          ];
        }
      } else if (formData.role === 'High School') {
        // Remove the auto-applied high_school condition when changing away
        updatedFormData.workflowCondition = updatedFormData.workflowCondition.filter(
          c => c !== 'high_school'
        );
        if (updatedFormData.workflowCondition.length === 0) {
          updatedFormData.conditional = false;
        }
      }

      setFormData(updatedFormData);
    } else if (name === 'workflowCondition' && type === 'array') {
      // Special case for array values
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      // Force a re-render by creating a brand new object
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    // Always prevent default form submission behavior
    e.preventDefault();
    console.log('Form submission attempt');
    
    // Validate the form
    const validationErrors = validateStep(formData);
    console.log('Validation errors:', validationErrors);
    
    if (Object.keys(validationErrors).length === 0) {
      // First submit the main step
      const stepData = { ...formData };
      
      // Remove the pendingFeedbackSteps array from main step data
      const pendingFeedbackSteps = [...(stepData.pendingFeedbackSteps || [])];
      delete stepData.pendingFeedbackSteps;
      
      // Submit the main step
      console.log('Submitting step data:', stepData);
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

  // Direct save handler for save button
  const handleSaveClick = () => {
    console.log('Save button clicked');
    console.log('Current form data:', formData);
    
    const validationErrors = validateStep(formData);
    console.log('Validation errors:', validationErrors);
    
    if (Object.keys(validationErrors).length === 0) {
      try {
        // First submit the main step
        const stepData = { ...formData };
        
        // Remove the pendingFeedbackSteps array from main step data
        const pendingFeedbackSteps = [...(stepData.pendingFeedbackSteps || [])];
        delete stepData.pendingFeedbackSteps;
        
        // Submit the main step
        console.log('Submitting step data:', stepData);
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
      } catch (error) {
        console.error('Error submitting form:', error);
      }
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <form className="space-y-0" onSubmit={handleSubmit} id="stepForm">
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
        errors={errors} 
        workflowConditions={workflowConditions}
        onManageWorkflowConditions={onManageWorkflowConditions}
      />

      {/* Table Columns - not for Information or Consent steps or System processed steps */}
      {formData.stepType !== 'Information' && 
       formData.stepType !== 'ProvideConsent' && 
       formData.stepType !== 'RegisterViaApi' &&
       formData.stepType !== 'PendingCompletionOfOneTimeSteps' &&
       formData.stepType !== 'PendingCompletionOfPerTermSteps' &&
       formData.stepType !== 'PendingCompletionOfPerYearSteps' && (
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

      {formData.stepType === 'ReviewFailedRegistration' && (
        <ReviewFailedRegistrationStepSection 
          formData={formData} 
          setFormData={setFormData} 
          errors={errors} 
        />
      )}

      {formData.stepType === 'PendingCompletionOfOneTimeSteps' && (
        <PendingCompletionOfOneTimeStepsSection 
          formData={formData} 
          handleChange={handleChange} 
          errors={errors} 
        />
      )}

      {formData.stepType === 'PendingCompletionOfPerTermSteps' && (
        <PendingCompletionOfPerTermStepsSection 
          formData={formData} 
          handleChange={handleChange} 
          errors={errors} 
        />
      )}

      {formData.stepType === 'PendingCompletionOfPerYearSteps' && (
        <PendingCompletionOfPerYearStepsSection 
          formData={formData} 
          handleChange={handleChange} 
          errors={errors} 
        />
      )}

      {/* Feedback Loops - only for Approval steps and ReviewFailedRegistration */}
      {(formData.stepType === 'Approval' || formData.stepType === 'ReviewFailedRegistration') && (
        <FeedbackLoopsSection 
          formData={formData} 
          setFormData={setFormData} 
          onAddFeedbackStep={onAddFeedbackStep}
        />
      )}

      {/* Comments Section - not for Consent steps or System processed steps */}
      {formData.stepType !== 'ProvideConsent' && 
       formData.stepType !== 'RegisterViaApi' && 
       formData.stepType !== 'PendingCompletionOfOneTimeSteps' && 
       formData.stepType !== 'PendingCompletionOfPerTermSteps' && 
       formData.stepType !== 'PendingCompletionOfPerYearSteps' && (
        <CommentsSection 
          formData={formData} 
          setFormData={setFormData} 
          errors={errors} 
        />
      )}

      {/* Form Buttons */}
      <div className="flex justify-end gap-3 pt-4" data-testid="modal-actions">
        <button 
          type="button" 
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
          data-testid="modal-cancel-button"
        >
          Cancel
        </button>
        <button 
          type="button"
          onClick={handleSaveClick}
          className="px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded-md"
          data-testid="modal-save-button"
        >
          Save Step
        </button>
      </div>
    </form>
  );
};

export default StepForm;
