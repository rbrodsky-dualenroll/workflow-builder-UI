import React from 'react';
import { getStepTypeColor } from './stepUtils';
import ConditionalDisplay from './ConditionalDisplay';

/**
 * Header component for workflow steps
 */
const StepHeader = ({ 
  step, 
  index, 
  onEdit, 
  onDelete, 
  isExpanded, 
  setIsExpanded,
  isConditionalStep 
}) => {
  const getSubworkflowBadge = () => {
    if (!step.subworkflow) return null;
    
    let bgColor;
    switch (step.subworkflow) {
      case 'Once Ever': bgColor = 'bg-purple-100 text-purple-800'; break;
      case 'Per Year': bgColor = 'bg-blue-100 text-blue-800'; break;
      case 'Per Term': bgColor = 'bg-green-100 text-green-800'; break;
      case 'Per Course': bgColor = 'bg-orange-100 text-orange-800'; break;
      default: bgColor = 'bg-gray-100 text-gray-800';
    }
    
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full ${bgColor}`}>
        {step.subworkflow}
      </span>
    );
  };

  return (
    <div className={`flex border-l-4 ${getStepTypeColor(step.stepType)} bg-white shadow-sm ${isConditionalStep ? 'border-l-dashed ml-4' : ''}`}>
      <div className="step-header flex-grow">
        <div className="step-number">{index + 1}</div>
        <div className="flex flex-col md:flex-row md:items-center">
          <div className="step-type font-medium flex items-center">
            {step.role ? `${step.role}: ` : ''}
            {step.title || `${step.stepType} Step`}
            {isConditionalStep && (
              <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">
                Conditional
              </span>
            )}
          </div>
          {getSubworkflowBadge()}
        </div>
        {isConditionalStep && step.scenarioCondition && (
          <div className="mt-1 text-xs text-blue-600 pl-9">
            <span className="font-medium">Scenario:</span> {step.scenarioCondition}
          </div>
        )}
        
        {step.conditional && (step.triggeringCondition || step.workflowCondition) && (
          <div className="pl-9">
            <ConditionalDisplay 
              conditionValue={step.triggeringCondition} 
              workflowConditionName={step.workflowCondition}
            />
          </div>
        )}
      </div>
      
      <div className="step-controls p-2 flex items-start gap-1">
        <button 
          onClick={() => setIsExpanded(!isExpanded)} 
          className="text-gray-500 hover:bg-gray-100 p-1.5 rounded" 
          title="Toggle Preview"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <button 
          onClick={onEdit} 
          className="text-blue-500 hover:bg-blue-50 p-1.5 rounded" 
          title="Edit Step"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </button>
        <button 
          onClick={onDelete} 
          className="text-red-500 hover:bg-red-50 p-1.5 rounded" 
          title="Delete Step"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default StepHeader;
