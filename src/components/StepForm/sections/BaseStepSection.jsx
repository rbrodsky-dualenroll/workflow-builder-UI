import React from 'react';
import FormField from '../../common/FormField';
import { canStepTerminateWorkflow, getTerminationOptions } from '../../../utils/workflowUtils';

/**
 * Base step section for common fields shared across all step types
 */
const BaseStepSection = ({ formData, handleChange, errors = {} }) => {
  const stepTypeOptions = [
    { value: 'Approval', label: 'Approval' },
    { value: 'Upload', label: 'Document Upload' },
    { value: 'Information', label: 'Information' },
    { value: 'ProvideConsent', label: 'Provide Consent' },
    { value: 'CheckHolds', label: 'Check Holds' },
    { value: 'RegisterViaApi', label: 'Register Via API' },
    { value: 'ResolveIssue', label: 'Resolve Issue' },
    { value: 'PendingCompletionOfOneTimeSteps', label: 'Pending Completion of One-Time Steps' },
    { value: 'PendingCompletionOfPerTermSteps', label: 'Pending Completion of Per Term Steps' },
    { value: 'PendingCompletionOfPerYearSteps', label: 'Pending Completion of Per Year Steps' },
  ];

  const workflowCategoryOptions = [
    { value: 'One Time', label: 'One Time', description: 'Steps that only run once for each student (CollegeStudentApplication + registration_one_time)' },
    { value: 'Per Academic Year', label: 'Per Academic Year', description: 'Steps that run once per academic year (StudentTerm + registration_academic_year)' },
    { value: 'Per Term', label: 'Per Term', description: 'Steps that run once per term for each student (StudentTerm + registration)' },
    { value: 'Per Course', label: 'Per Course', description: 'Steps that run for each course registration (StudentDeCourse + registration)' },
    { value: 'Drop/Withdraw', label: 'Drop/Withdraw', description: 'Steps for dropping or withdrawing from courses (StudentDeCourse + registration_drop_withdraw)' },
  ];

  const roleOptions = [
    { value: 'College', label: 'College' },
    { value: 'High School', label: 'High School' },
    { value: 'Student', label: 'Student' },
    { value: 'Parent', label: 'Parent' },
    { value: 'Approver', label: 'Approver' },
    { value: 'Dean', label: 'Dean' },
    { value: 'System', label: 'System' },
  ];

  // Check if this is a system-only step type
  const isSystemOnlyStep = 
    formData.stepType === 'RegisterViaApi' ||
    formData.stepType === 'PendingCompletionOfOneTimeSteps' ||
    formData.stepType === 'PendingCompletionOfPerTermSteps' ||
    formData.stepType === 'PendingCompletionOfPerYearSteps';

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Step Type"
          name="stepType"
          type="select"
          value={formData.stepType}
          onChange={handleChange}
          options={stepTypeOptions}
          error={errors.stepType}
          required
          data-testid="step-form-type"
        />

        <FormField
          label="Workflow Category"
          name="workflow_category"
          type="select"
          value={formData.workflow_category}
          onChange={handleChange}
          options={workflowCategoryOptions}
          error={errors.workflow_category}
          data-testid="field-workflow-category"
          helpText="Defines the level at which this workflow operates"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isSystemOnlyStep && formData.stepType.includes('Pending') ? (
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1">Step Title</label>
            <div className="p-2 border border-gray-300 bg-gray-50 rounded-md">
              <span className="text-gray-700">{formData.stepType}</span>
            </div>
            <p className="mt-1 text-xs text-gray-500">Pending steps use the step type as title</p>
          </div>
        ) : (
          <FormField
            label="Step Title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            placeholder={`${formData.stepType} Step`}
            error={errors.title}
            required
            data-testid="step-form-title"
          />
        )}

        <FormField
          label="Role"
          name="role"
          type="select"
          value={formData.role}
          onChange={handleChange}
          options={roleOptions}
          error={errors.role}
          required
          disabled={isSystemOnlyStep}
          helpText={isSystemOnlyStep ? 'This step type always uses System role' : ''}
          data-testid="field-role"
        />
      </div>

      <FormField
        label="Description"
        name="description"
        type="textarea"
        value={formData.description}
        onChange={handleChange}
        placeholder="Enter step description"
        error={errors.description}
        data-testid="step-form-description"
      />
      
      {/* Step termination is now handled silently in the background */}
    </>
  );
};

export default BaseStepSection;
