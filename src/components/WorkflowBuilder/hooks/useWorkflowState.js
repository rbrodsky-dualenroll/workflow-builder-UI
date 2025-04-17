import { useState } from 'react';
import { getMergedWorkflow } from '../ScenarioOperations';

/**
 * Custom hook to manage workflow state
 */
const useWorkflowState = () => {
  // Main state for scenarios and active scenario
  const [scenarios, setScenarios] = useState({
    main: {
      id: 'main',
      name: 'Main Workflow',
      steps: []
    }
  });
  const [activeScenarioId, setActiveScenarioId] = useState('main');
  const [masterView, setMasterView] = useState(false);
  
  // UI state
  const [workflowName, setWorkflowName] = useState('New Workflow');
  
  // College information for export
  const [collegeInfo, setCollegeInfo] = useState({
    name: '',
    id: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    url: '',
    type: 'Public: 2-year'
  });

  // Helper to get current workflow based on active scenario
  const workflow = masterView 
    ? getMergedWorkflow(scenarios) 
    : scenarios[activeScenarioId]?.steps || [];

  return {
    scenarios,
    setScenarios,
    activeScenarioId,
    setActiveScenarioId,
    masterView,
    setMasterView,
    workflowName,
    setWorkflowName,
    collegeInfo,
    setCollegeInfo,
    workflow
  };
};

export default useWorkflowState;
