import React from 'react';
import Modal from './Modal';

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
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Scenario" size="sm">
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
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="base-scenario" className="block text-sm font-medium mb-1">Base Scenario</label>
          <select
            id="base-scenario"
            value={baseScenarioId}
            onChange={(e) => setBaseScenarioId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            {Object.values(scenarios).map(scenario => (
              <option key={scenario.id} value={scenario.id}>
                {scenario.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">The new scenario will start with a copy of this scenario's steps</p>
        </div>
        
        <div className="flex justify-end gap-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-800"
          >
            Cancel
          </button>
          <button 
            onClick={onCreate}
            className="px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded"
            disabled={!scenarioName.trim()}
          >
            Create
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ScenarioModal;
