import React from 'react';
import Card from '../../common/Card';
import CollapsibleCard from '../../common/CollapsibleCard';

/**
 * Section for the Review Failed Registration step type
 * This step allows a college user to review a failed registration and:
 * - Resubmit after fixing the issue
 * - Mark as manually completed (if the student was enrolled directly in the SIS)
 * - Decline the registration entirely
 * - Choose a new course section (in case of section full)
 */
const ReviewFailedRegistrationSection = ({ formData, setFormData, errors = {} }) => {
  // Default action options for Review Failed Registration steps
  const defaultActionOptions = [
    { 
      label: 'Resubmit', 
      value: 'college_resubmit_registration_yes', 
      canTerminate: false, 
      terminates_workflow: false,
      description: 'I have corrected the issue; resubmit the registration'
    },
    { 
      label: 'Mark Complete', 
      value: 'college_resubmit_registration_complete', 
      canTerminate: true, 
      terminates_workflow: true,
      description: 'Student was manually enrolled in SIS. Mark as complete in DualEnroll.'
    },
    { 
      label: 'Decline', 
      value: 'college_resubmit_registration_no', 
      canTerminate: true, 
      terminates_workflow: true,
      description: 'Terminate the registration and notify the student and counselor'
    },
    { 
      label: 'Choose New Section', 
      value: 'college_resubmit_registration_choose_new_section', 
      canTerminate: false, 
      terminates_workflow: false,
      description: 'Allow the student to select a different course section'
    }
  ];

  // Set default action options if none exist
  React.useEffect(() => {
    if (!formData.actionOptions || formData.actionOptions.length === 0) {
      setFormData({
        ...formData,
        actionOptions: defaultActionOptions,
        title: formData.title || 'Review Failed Registration',
        role: formData.role || 'College',
        comments: {
          ...(formData.comments || {}),
          required: true,
          public: true
        },
        // Initialize feedback loops object if it doesn't exist
        feedbackLoops: formData.feedbackLoops || {}
      });
    }
  }, [formData, setFormData]);

  return (
    <Card title="Review Failed Registration Configuration" className="bg-white mb-6">
      <div className="bg-gray-50 p-3 rounded-md border border-gray-300 mb-4">
        <p className="text-sm text-gray-700">
          This step is used to review a failed registration attempt and determine how to proceed.
          The user can choose to resubmit the registration, mark it as complete, decline it, or
          allow the student to choose a new course section.
        </p>
        <p className="text-sm text-gray-700 mt-2">
          The "Resubmit" option will clear previous failure states and send the registration back to 
          the RegisterViaAPI step for another attempt.
        </p>
      </div>

      <div className="p-3 border border-gray-200 rounded-md bg-white mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Default Action Options</h3>
        <ul className="list-disc pl-5 space-y-2">
          {defaultActionOptions.map((option, index) => (
            <li key={index} className="text-sm">
              <span className="font-medium">{option.label}</span>: {option.description}
              {option.canTerminate && (
                <span className="ml-1 text-xs text-red-500">
                  (Terminates workflow)
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-3">
        <p className="text-sm text-gray-600 mb-1">
          To add "Resolve Issues" options for students or high schools, use the Feedback Loops section below.
        </p>
        <p className="text-sm text-gray-600">
          This allows you to create feedback steps that will be triggered when certain actions are selected.
        </p>
      </div>
    </Card>
  );
};

export default ReviewFailedRegistrationSection;