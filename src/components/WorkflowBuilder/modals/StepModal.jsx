import React from 'react';
import StepForm from '../../StepForm/StepForm';

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
  onAddFeedbackStep
}) => {
  if (!isOpen) return null;

  // Handle backdrop click to close the modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" 
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-lg p-6 w-5/6 max-w-4xl max-h-[90vh] overflow-y-auto" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-primary">{title}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <StepForm 
          initialData={initialData}
          onSubmit={onSubmit}
          onCancel={onClose}
          scenarioId={scenarioId}
          scenarioCondition={scenarioCondition}
          onAddFeedbackStep={onAddFeedbackStep}
        />
      </div>
    </div>
  );
};

export default StepModal;
