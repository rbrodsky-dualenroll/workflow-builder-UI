import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import CollapsibleCard from '../../common/CollapsibleCard';
import NestedConditionModal from './NestedConditionModal';

/**
 * Modal for editing an existing scenario
 */
const EditScenarioModal = ({ 
  isOpen, 
  onClose, 
  scenario,
  workflowConditions = {},
  onUpdateScenario,
  onManageWorkflowConditions
}) => {
  const [scenarioName, setScenarioName] = useState('');
  const [scenarioCondition, setScenarioCondition] = useState('');
  const [isConditionSectionOpen, setIsConditionSectionOpen] = useState(true);
  const [showConditionModal, setShowConditionModal] = useState(false);
  const [temporaryCondition, setTemporaryCondition] = useState(null);
  
  // Initialize form fields when scenario changes or modal opens
  useEffect(() => {
    if (isOpen && scenario) {
      setScenarioName(scenario.name);
      setScenarioCondition(scenario.condition || '');
    }
  }, [isOpen, scenario]);
  
  const handleUpdate = () => {
    if (!scenarioName.trim()) return;
    
    const updatedScenario = {
      ...scenario,
      name: scenarioName.trim(),
      condition: scenarioCondition
    };
    
    onUpdateScenario(updatedScenario);
    onClose();
  };
  
  if (!isOpen || !scenario) return null;
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Scenario" size="md" data-testid="edit-scenario-modal">
      <div className="px-6 pb-6">
        <div className="mb-4">
          <label htmlFor="scenario-name" className="block text-sm font-medium mb-1">Scenario Name</label>
          <input
            id="scenario-name"
            type="text"
            value={scenarioName}
            onChange={(e) => setScenarioName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="e.g., Home School Path"
            data-testid="edit-scenario-name-input"
          />
        </div>
        
        <div className="mb-4">
          <CollapsibleCard 
            title="Scenario Condition" 
            isOpen={isConditionSectionOpen}
            onToggle={() => setIsConditionSectionOpen(!isConditionSectionOpen)}
            id="edit-scenario-conditions-section"
            data-testid="edit-scenario-conditions-section"
          >
            <p className="text-sm mb-4" data-testid="edit-scenario-conditions-intro">
              A scenario condition determines when this scenario will be active. All steps in this scenario will inherit this condition.
            </p>
            
            {/* Display available conditions as radio buttons */}
            {Object.keys(workflowConditions).length > 0 ? (
              <div className="space-y-3 mb-4" data-testid="edit-scenario-conditions-list">
                {Object.entries(workflowConditions).map(([conditionName, condition]) => (
                  <div key={conditionName} className="flex items-start" data-testid={`edit-scenario-condition-item-${conditionName}`} data-condition-name={conditionName}>
                    <input
                      id={`edit-scenario-condition-${conditionName}`}
                      type="radio"
                      name="scenarioCondition"
                      checked={scenarioCondition === conditionName}
                      onChange={() => setScenarioCondition(conditionName)}
                      className="h-4 w-4 mt-1 text-primary focus:ring-primary border-gray-300"
                      data-testid={`edit-scenario-condition-radio-${conditionName}`}
                      data-action="select-scenario-condition"
                      data-condition-name={conditionName}
                    />
                    <label htmlFor={`edit-scenario-condition-${conditionName}`} className="ml-2 block">
                      <div className="font-medium text-sm">{conditionName}</div>
                      <div className="text-xs text-gray-600">
                        {workflowConditions[conditionName] ? conditionName : 'Condition not found'}
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-gray-100 border border-dashed border-gray-300 rounded-md mb-4 text-center" data-testid="edit-no-scenario-conditions-message">
                <p className="text-gray-500 text-sm">No workflow conditions available. Create your first condition below.</p>
              </div>
            )}
            
            {/* Add New Condition button */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                // Create a new empty condition that will be populated in the modal
                const newCondition = { 
                  entity: '', 
                  property: '', 
                  comparison: '', 
                  value: '', 
                  fields: [] 
                };
                setTemporaryCondition(newCondition);
                setShowConditionModal(true);
              }}
              className="w-full px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded-md text-sm flex items-center justify-center"
              data-testid="edit-add-scenario-condition-button"
              data-action="add-scenario-condition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add New Condition
            </button>
          </CollapsibleCard>
        </div>
        
        <div className="flex justify-end gap-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-800"
            data-testid="edit-scenario-modal-cancel-button"
          >
            Cancel
          </button>
          <button 
            onClick={handleUpdate}
            className="px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded"
            data-testid="edit-scenario-modal-save-button"
            disabled={!scenarioName.trim()}
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Nested Condition Manager Modal */}
      <NestedConditionModal
        isOpen={showConditionModal}
        onClose={() => setShowConditionModal(false)}
        conditions={workflowConditions}
        onUpdate={(updatedConditions) => {
          onManageWorkflowConditions(updatedConditions);
          setShowConditionModal(false);
        }}
        initialCondition={temporaryCondition}
        title="Add New Condition"
      />
    </Modal>
  );
};

export default EditScenarioModal;