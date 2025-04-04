import React, { useState } from 'react';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';

/**
 * Modal for managing scenarios
 */
const ManageScenariosModal = ({ 
  isOpen, 
  onClose, 
  scenarios,
  onDeleteScenario,
  onEditScenario,
  workflowConditions = {}
}) => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [scenarioToDelete, setScenarioToDelete] = useState(null);
  
  const handleDeleteClick = (scenarioId) => {
    setScenarioToDelete(scenarioId);
    setShowDeleteConfirmation(true);
  };
  
  const handleConfirmDelete = () => {
    if (scenarioToDelete) {
      onDeleteScenario(scenarioToDelete);
      setShowDeleteConfirmation(false);
      setScenarioToDelete(null);
    }
  };
  
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Manage Scenarios" size="md">
        <div className="px-6 pb-6">
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-4">
              Manage your workflow scenarios. You can delete scenarios that are no longer needed.
            </p>
            
            <div className="overflow-hidden border border-gray-200 rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Scenario Name
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.values(scenarios).map(scenario => (
                    <tr key={scenario.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {scenario.name}
                            {scenario.id === 'main' && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Main
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {scenario.id !== 'main' && (
                            <>
                              <button
                                onClick={() => onEditScenario(scenario.id)}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                                data-testid={`edit-scenario-${scenario.id}`}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteClick(scenario.id)}
                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm ml-2"
                                data-testid={`delete-scenario-${scenario.id}`}
                              >
                                Delete
                              </button>
                            </>
                          )}
                          {scenario.id === 'main' && (
                            <>
                              <button
                                onClick={() => onEditScenario(scenario.id)}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                                data-testid={`edit-scenario-${scenario.id}`}
                              >
                                Edit
                              </button>
                              <span className="text-gray-400">Cannot delete main scenario</span>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-800"
              data-testid="manage-scenarios-close-button"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
      
      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Scenario"
        message={`Are you sure you want to delete this scenario? This action cannot be undone.`}
        confirmButtonText="Delete"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        data-testid="delete-scenario-confirmation-modal"
      />
    </>
  );
};

export default ManageScenariosModal;