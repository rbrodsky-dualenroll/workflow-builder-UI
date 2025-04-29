import { useState } from 'react';

/**
 * Custom hook to manage workflow state
 * Simplified to use a flat workflow structure instead of scenarios
 */
const useWorkflowState = () => {
  // Main workflow state - now a simple array instead of scenarios
  const [workflow, setWorkflow] = useState([]);
  
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

  return {
    workflow,
    setWorkflow,
    workflowName,
    setWorkflowName,
    collegeInfo,
    setCollegeInfo
  };
};

export default useWorkflowState;
