import React from 'react';
import { parseConditionals, formatConditionalsForDisplay } from '../../utils/conditionalUtils';

/**
 * Displays conditional rules in a readable format
 */
const ConditionalDisplay = ({ conditionValue, workflowConditionName }) => {
  // If we have a named workflow condition, just display that
  if (workflowConditionName) {
    return (
      <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs">
        <div className="font-medium text-amber-800 mb-1">Conditional Logic:</div>
        <div className="text-amber-700 text-xs">
          Using workflow condition: <span className="font-medium">{workflowConditionName}</span>
        </div>
      </div>
    );
  }
  
  // Otherwise parse and display the conditions as before
  try {
    // Parse the conditions
    const conditions = parseConditionals(conditionValue);
    
    // If no conditions, return null
    if (!conditions || conditions.length === 0) {
      return null;
    }
    
    return (
      <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs">
        <div className="font-medium text-amber-800 mb-1">Conditional Logic:</div>
        <pre className="whitespace-pre-wrap font-mono text-amber-700 text-xs">
          {formatConditionalsForDisplay(conditions)}
        </pre>
      </div>
    );
  } catch (error) {
    console.error('Error parsing condition:', error);
    return (
      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
        <div className="font-medium text-red-800 mb-1">Error displaying condition:</div>
        <div className="text-red-700 text-xs">{error.message}</div>
      </div>
    );
  }
};

export default ConditionalDisplay;
