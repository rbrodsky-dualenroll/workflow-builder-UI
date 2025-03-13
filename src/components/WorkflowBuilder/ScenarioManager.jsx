import React from 'react';

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
}) => {
  return (
    <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-gray-700">Scenarios</h2>
        <div className="flex gap-2">
          <button 
            onClick={onAddScenario}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            New Scenario
          </button>
          <button 
            onClick={() => setMasterView(!masterView)}
            className={`px-3 py-1 rounded text-sm flex items-center ${masterView ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            {masterView ? 'Exit Master View' : 'Master View'}
          </button>
        </div>
      </div>
      
      {/* Scenario tabs */}
      <div className="flex flex-wrap gap-2 mt-2">
        {Object.values(scenarios).map(scenario => (
          <button
            key={scenario.id}
            onClick={() => { setActiveScenarioId(scenario.id); setMasterView(false); }}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors 
              ${activeScenarioId === scenario.id && !masterView 
                ? 'bg-primary text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'}
              ${scenario.id === 'main' ? 'border-l-4 border-l-primary' : ''}
            `}
          >
            {scenario.name}
            {scenario.id !== 'main' && (
              <button 
                onClick={(e) => { e.stopPropagation(); onDeleteScenario(scenario.id); }}
                className="ml-2 text-gray-500 hover:text-red-500"
                title="Delete scenario"
              >
                ×
              </button>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ScenarioManager;
