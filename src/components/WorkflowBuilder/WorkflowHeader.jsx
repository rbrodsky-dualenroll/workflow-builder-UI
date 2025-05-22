import React from 'react';

/**
 * Header component for the workflow builder
 */
const WorkflowHeader = ({
  workflowName,
  onSave,
  onImport,
  onNew,
  onStartFromTemplate,
  onExportDevTeam,
  onToggleDisplayMode,
  isDisplayMode
}) => {
  return (
    <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-200">
      <h1 className="text-2xl font-bold text-primary">{workflowName}</h1>
      <div className="flex gap-2">
        {!isDisplayMode && (
          <>
            <button
              onClick={onNew}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm"
              data-testid="new-workflow-button"
              data-action="new-workflow"
            >
              New Workflow
            </button>
            <button
              onClick={onStartFromTemplate}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm"
              data-testid="start-from-template-button"
              data-action="start-from-template"
            >
              Start from Template
            </button>
            <input
              type="file"
              id="import-workflow"
              accept=".json"
              onChange={onImport}
              className="hidden"
              data-testid="import-workflow-input"
            />
            <label
              htmlFor="import-workflow"
              className="bg-secondary hover:bg-secondary-600 text-white px-4 py-2 rounded text-sm cursor-pointer"
              data-testid="import-workflow-button"
              data-action="import-workflow"
            >
              Import Workflow
            </label>
            <button
              onClick={onSave}
              className="bg-primary hover:bg-primary-600 text-white px-4 py-2 rounded text-sm"
              data-testid="save-workflow-button"
              data-action="save-workflow"
            >
              Save Workflow
            </button>
            <button
              onClick={onExportDevTeam}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded text-sm"
              data-testid="export-dev-team-button"
              data-action="export-dev-team"
            >
              Export for Dev Team
            </button>
          </>
        )}
        <button
          onClick={onToggleDisplayMode}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded text-sm"
          data-testid="display-mode-toggle"
          data-action="toggle-display-mode"
        >
          {isDisplayMode ? 'Exit Display' : 'Display Mode'}
        </button>
      </div>
    </div>
  );
};

export default WorkflowHeader;
