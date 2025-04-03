import React, { useState } from 'react';
import Modal from './Modal';
import { formatConditionForDisplay } from '../../../utils/conditionalUtils';
import CollapsibleCard from '../../common/CollapsibleCard';
import NestedConditionModal from './NestedConditionModal';

/**
 * Modal for creating a new scenario
 */
const ScenarioModal = ({ 
  isOpen, 
  onClose, 
  scenarioName,
  setScenarioName,
  baseScenarioId,
  setBaseScenarioId,
  scenarios,
  onCreate,
  workflowConditions = {},
  onManageWorkflowConditions,
  scenarioCondition = '',
  setScenarioCondition
}) => {
  const [isConditionSectionOpen, setIsConditionSectionOpen] = useState(true);
  const [showConditionModal, setShowConditionModal] = useState(false);
  const [temporaryCondition, setTemporaryCondition] = useState(null);
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Scenario" size="md">
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
            data-testid="scenario-name-input"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="base-scenario" className="block text-sm font-medium mb-1">Base Scenario</label>
          <select
            id="base-scenario"
            value={baseScenarioId}
            onChange={(e) => setBaseScenarioId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            data-testid="base-scenario-select"
          >
            {Object.values(scenarios).map(scenario => (
              <option key={scenario.id} value={scenario.id}>
                {scenario.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">The new scenario will start with a copy of this scenario's steps</p>
        </div>
        
        <div className="mb-4">
          <CollapsibleCard 
            title="Scenario Condition" 
            isOpen={isConditionSectionOpen}
            onToggle={() => setIsConditionSectionOpen(!isConditionSectionOpen)}
            id="scenario-conditions-section"
            data-testid="scenario-conditions-section"
          >
            <p className="text-sm mb-4" data-testid="scenario-conditions-intro">
              A scenario condition determines when this scenario will be active. All steps in this scenario will inherit this condition.
            </p>
            
            {/* Display available conditions as radio buttons */}
            {Object.keys(workflowConditions).length > 0 ? (
              <div className="space-y-3 mb-4" data-testid="scenario-conditions-list">
                {Object.entries(workflowConditions).map(([conditionName, condition]) => (
                  <div key={conditionName} className="flex items-start" data-testid={`scenario-condition-item-${conditionName}`} data-condition-name={conditionName}>
                    <input
                      id={`scenario-condition-${conditionName}`}
                      type="radio"
                      name="scenarioCondition"
                      checked={scenarioCondition === conditionName}
                      onChange={() => setScenarioCondition(conditionName)}
                      className="h-4 w-4 mt-1 text-primary focus:ring-primary border-gray-300"
                      data-testid={`scenario-condition-radio-${conditionName}`}
                      data-action="select-scenario-condition"
                      data-condition-name={conditionName}
                    />
                    <label htmlFor={`scenario-condition-${conditionName}`} className="ml-2 block">
                      <div className="font-medium text-sm">{conditionName}</div>
                      <div className="text-xs text-gray-600">
                        {formatConditionForDisplay(condition)}
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-gray-100 border border-dashed border-gray-300 rounded-md mb-4 text-center" data-testid="no-scenario-conditions-message">
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
              data-testid="add-scenario-condition-button"
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
            data-testid="scenario-modal-cancel-button"
          >
            Cancel
          </button>
          <button 
            onClick={onCreate}
            className="px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded"
            data-testid="scenario-modal-create-button"
            disabled={!scenarioName.trim()}
          >
            Create
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

export default ScenarioModal;