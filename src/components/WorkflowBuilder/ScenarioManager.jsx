import React, { useState } from 'react';
import ManageScenariosModal from './modals/ManageScenariosModal';
import EditScenarioModal from './modals/EditScenarioModal';

/**
 * Component for managing workflow scenarios
 */
const ScenarioManager = ({ 
  scenarios, 
  activeScenarioId, 
  setActiveScenarioId,
  masterView,
  setMasterView,
  onAddScenario,
  onDeleteScenario,
  onUpdateScenario,
  workflowConditions = {}
}) => {
  const [showManageModal, setShowManageModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [scenarioToEdit, setScenarioToEdit] = useState(null);
  
  const handleEditScenario = (scenarioId) => {
    setScenarioToEdit(scenarios[scenarioId]);
    setShowEditModal(true);
    setShowManageModal(false); // Close the manage modal if it's open
  };
  return (
    <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-gray-700">Scenarios</h2>
        <div className="flex gap-2">
          <button 
            onClick={onAddScenario}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center"
            data-testid="new-scenario-button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            New Scenario
          </button>
          <button 
            onClick={() => setShowManageModal(true)}
            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm flex items-center"
            data-testid="manage-scenarios-button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            Manage
          </button>
          <button 
            onClick={() => setMasterView(!masterView)}
            className={`px-3 py-1 rounded text-sm flex items-center ${masterView ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            data-testid="master-view-button"
          >
            {masterView ? 'Exit Master View' : 'Master View'}
          </button>
        </div>
      
      {/* Render the Manage Scenarios Modal */}
      <ManageScenariosModal
        isOpen={showManageModal}
        onClose={() => setShowManageModal(false)}
        scenarios={scenarios}
        onDeleteScenario={onDeleteScenario}
        onEditScenario={handleEditScenario}
        workflowConditions={workflowConditions}
      />
      
      {/* Edit Scenario Modal */}
      <EditScenarioModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        scenario={scenarioToEdit}
        workflowConditions={workflowConditions}
        onUpdateScenario={(updatedScenario) => {
          onUpdateScenario(updatedScenario);
          setShowEditModal(false);
        }}
        onManageWorkflowConditions={(updatedConditions) => {
          // Update the conditions in the parent component
          // This is typically handled by the WorkflowBuilder component
          // which will need to be updated to support this functionality
        }}
      />
      </div>
      
      {/* Scenario tabs */}
      <div className="flex flex-wrap gap-2 mt-2">
        {Object.values(scenarios).map(scenario => (
          <button
            key={scenario.id}
            onClick={() => { setActiveScenarioId(scenario.id); setMasterView(false); }}
            data-testid={`scenario-tab-${scenario.id}`}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors 
              ${activeScenarioId === scenario.id && !masterView 
                ? 'bg-primary text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'}
              ${scenario.id === 'main' ? 'border-l-4 border-l-primary' : ''}
            `}
          >
            {scenario.name}
            {scenario.condition && scenario.id !== 'main' && (
              <span 
                className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                title={workflowConditions[scenario.condition] ? `Condition: ${scenario.condition}` : 'Conditional scenario'}
                data-testid={`scenario-condition-badge-${scenario.id}`}
              >
                {scenario.condition}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ScenarioManager;
