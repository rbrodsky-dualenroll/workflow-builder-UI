import React from 'react';
import { parseConditionals, formatConditionalsForDisplay } from '../../utils/conditionalUtils';

/**
 * Displays conditional rules in a readable format
 */
const ConditionalDisplay = ({ conditionValue }) => {
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
};

export default ConditionalDisplay;
