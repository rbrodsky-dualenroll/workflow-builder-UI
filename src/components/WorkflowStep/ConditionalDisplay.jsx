import React from 'react';

/**
 * Displays conditional rules in a readable format
 */
const ConditionalDisplay = ({ workflowConditionName }) => {
  return (
    <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs">
      <div className="font-medium text-amber-800 mb-1">Conditional Logic:</div>
      <div className="text-amber-700 text-xs">
        Using workflow condition: <span className="font-medium">{workflowConditionName}</span>
      </div>
    </div>
  );
};

export default ConditionalDisplay;
