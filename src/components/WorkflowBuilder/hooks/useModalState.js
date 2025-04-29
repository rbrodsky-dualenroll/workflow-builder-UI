import { useState } from 'react';

/**
 * Custom hook to manage modal states and related data
 */
const useModalState = () => {
  // Modal states
  const [isAddingStep, setIsAddingStep] = useState(false);
  const [editingStep, setEditingStep] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showNewWorkflowModal, setShowNewWorkflowModal] = useState(false);

  return {
    // Modal states
    isAddingStep,
    setIsAddingStep,
    editingStep,
    setEditingStep,
    showSaveModal,
    setShowSaveModal,
    showNewWorkflowModal,
    setShowNewWorkflowModal
  };
};

export default useModalState;
