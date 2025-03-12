import React from 'react';
import StepForm from '../../StepForm/StepForm';
import Modal from './Modal';

/**
 * Modal for adding or editing a step
 */
const StepModal = ({ 
  isOpen, 
  onClose, 
  title = 'Add New Step', 
  initialData = {}, 
  onSubmit,
  scenarioId,
  scenarioCondition,
  onAddFeedbackStep,
  workflowConditions = {},
  onManageWorkflowConditions
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <div className="px-6 pb-6">
        <StepForm 
          initialData={initialData}
          onSubmit={onSubmit}
          onCancel={onClose}
          scenarioId={scenarioId}
          scenarioCondition={scenarioCondition}
          onAddFeedbackStep={onAddFeedbackStep}
          workflowConditions={workflowConditions}
          onManageWorkflowConditions={onManageWorkflowConditions}
        />
      </div>
    </Modal>
  );
};

export default StepModal;
