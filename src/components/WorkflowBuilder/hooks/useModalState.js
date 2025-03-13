import { useState } from 'react';

/**
 * Custom hook to manage modal states and related data
 */
const useModalState = () => {
  // Modal states
  const [isAddingStep, setIsAddingStep] = useState(false);
  const [editingStep, setEditingStep] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showScenarioModal, setShowScenarioModal] = useState(false);
  const [showNewWorkflowModal, setShowNewWorkflowModal] = useState(false);
  
  // New scenario form state
  const [newScenarioName, setNewScenarioName] = useState('');
  const [baseScenarioId, setBaseScenarioId] = useState('main');

  return {
    // Modal states
    isAddingStep,
    setIsAddingStep,
    editingStep,
    setEditingStep,
    showSaveModal,
    setShowSaveModal,
    showScenarioModal,
    setShowScenarioModal,
    showNewWorkflowModal,
    setShowNewWorkflowModal,
    
    // New scenario form state
    newScenarioName,
    setNewScenarioName,
    baseScenarioId,
    setBaseScenarioId
  };
};

export default useModalState;
