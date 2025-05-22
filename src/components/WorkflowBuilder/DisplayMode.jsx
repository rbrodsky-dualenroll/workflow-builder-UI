import React, { useState } from 'react';
import StepPreview from '../WorkflowStep/StepPreview';

/**
 * Read-only display mode for client presentations
 * Allows filtering by workflow category and toggling conditions
 */
const WORKFLOW_CATEGORIES = [
  'All',
  'One Time',
  'Per Academic Year',
  'Per Term',
  'Per Course',
  'Drop/Withdraw'
];

const DisplayMode = ({ workflow = [], workflowConditions = {} }) => {
  // Selected workflow category filter
  const [category, setCategory] = useState('All');
  // Track which conditions are enabled
  const [conditions, setConditions] = useState(() => {
    const obj = {};
    Object.keys(workflowConditions).forEach(name => {
      obj[name] = true;
    });
    return obj;
  });

  // Toggle a condition on/off
  const toggleCondition = (name) => {
    setConditions(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  // Determine which steps are visible with current filters
  const visibleSteps = workflow.filter(step => {
    if (category !== 'All' && step.workflow_category !== category) {
      return false;
    }

    if (step.conditional && step.workflowCondition) {
      const conds = Array.isArray(step.workflowCondition)
        ? step.workflowCondition
        : [step.workflowCondition];
      return conds.every(c => conditions[c]);
    }
    return true;
  });

  return (
    <div data-testid="display-mode-container">
      <div className="p-4 bg-gray-50 rounded mb-4" data-testid="display-mode-controls">
        <div className="mb-2">
          <label className="mr-2 font-medium">Workflow Category:</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            data-testid="display-category-select"
            className="border rounded p-1"
          >
            {WORKFLOW_CATEGORIES.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        {Object.keys(workflowConditions).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {Object.keys(workflowConditions).map(name => (
              <label
                key={name}
                className="flex items-center gap-1"
                data-testid={`condition-toggle-${name}`}
              >
                <input
                  type="checkbox"
                  checked={conditions[name]}
                  onChange={() => toggleCondition(name)}
                />
                <span className="text-sm">{name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {visibleSteps.map(step => (
          <div key={step.id} className="border rounded" data-testid={`display-step-${step.id}`}>
            <div className="p-2 bg-gray-100 border-b">
              <h3 className="font-medium">{step.title || 'Untitled Step'}</h3>
              {step.role && (
                <p className="text-sm text-gray-600">Role: {step.role}</p>
              )}
            </div>
            <StepPreview step={step} />
          </div>
        ))}
        {visibleSteps.length === 0 && (
          <p className="text-gray-500" data-testid="display-no-steps">
            No steps match current filters.
          </p>
        )}
      </div>
    </div>
  );
};

export default DisplayMode;
