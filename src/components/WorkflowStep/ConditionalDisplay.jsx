import React from 'react';

/**
 * Displays conditional rules in a readable format
 */
const ConditionalDisplay = ({ workflowConditionNames }) => {
  // Ensure we're dealing with an array
  const conditionNames = Array.isArray(workflowConditionNames) 
    ? workflowConditionNames 
    : [workflowConditionNames].filter(Boolean);
    
  if (conditionNames.length === 0) return null;
  
  return (
    <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs" data-testid="conditional-display">
      <div className="font-medium text-amber-800 mb-1" data-testid="conditional-display-header">Conditional Logic:</div>
      {conditionNames.length === 1 ? (
        <div className="text-amber-700 text-xs" data-testid="conditional-display-single">
          Using workflow condition: <span className="font-medium" data-testid="conditional-display-condition-name">{conditionNames[0]}</span>
        </div>
      ) : (
        <div className="text-amber-700 text-xs" data-testid="conditional-display-multiple">
          <div className="mb-1">Using workflow conditions (ANY of these):</div>
          <ul className="list-disc pl-4">
            {conditionNames.map(name => (
              <li key={name} className="font-medium" data-testid={`conditional-display-condition-${name}`}>{name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ConditionalDisplay;
