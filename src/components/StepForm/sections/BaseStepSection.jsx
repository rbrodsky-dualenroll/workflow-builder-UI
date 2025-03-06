import React from 'react';
import FormField from '../../common/FormField';

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
  ];

  const subworkflowOptions = [
    { value: 'Once Ever', label: 'Once Ever' },
    { value: 'Per Year', label: 'Per Year' },
    { value: 'Per Term', label: 'Per Term' },
    { value: 'Per Course', label: 'Per Course' },
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
        />

        <FormField
          label="Sub-workflow"
          name="subworkflow"
          type="select"
          value={formData.subworkflow}
          onChange={handleChange}
          options={subworkflowOptions}
          error={errors.subworkflow}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Step Title"
          name="title"
          type="text"
          value={formData.title}
          onChange={handleChange}
          placeholder={`${formData.stepType} Step`}
          error={errors.title}
          required
        />

        <FormField
          label="Role"
          name="role"
          type="select"
          value={formData.role}
          onChange={handleChange}
          options={roleOptions}
          error={errors.role}
          required
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
      />
    </>
  );
};

export default BaseStepSection;
