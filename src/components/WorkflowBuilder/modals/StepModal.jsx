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
  // Check if we're editing a step from main workflow in a scenario
  const isMainStepInScenario = 
    scenarioId && 
    scenarioId !== 'main' && 
    initialData && 
    initialData.id && 
    !initialData.scenarioSpecific && 
    window.workflowBuilderState?.scenarios?.main?.steps?.some(step => step.id === initialData.id);
  
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
