import { useState, useEffect } from 'react';
import './App.css';
import WorkflowBuilder from './components/WorkflowBuilder/WorkflowBuilder';

/**
 * A test version of the App component that exposes workflow state for testing
 */
function TestApp() {
  const [testState, setTestState] = useState(null);

  // Initialize the test state on component mount
  useEffect(() => {
    // Create a global test state object that can be accessed by Puppeteer
    window.testWorkflowState = {
      scenarios: {
        main: {
          id: 'main',
          name: 'Test Workflow',
          steps: []
        }
      },
      activeScenarioId: 'main',
      updateUI: () => {
        // Force a re-render by updating the test state
        setTestState({
          ...window.testWorkflowState,
          updateTimestamp: Date.now()
        });
      }
    };
    
    // Set initial state
    setTestState(window.testWorkflowState);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Workflow Builder (Test Mode)</h1>
        <p className="test-mode-indicator">
          Running in test mode with Puppeteer hooks enabled
        </p>
      </header>
      
      <main className="app-main">
        {testState && (
          <div className="test-controls">
            <h2>Test Controls</h2>
            <div className="test-info">
              <p>Active Scenario: {testState.activeScenarioId}</p>
              <p>Steps: {testState.scenarios.main.steps.length}</p>
            </div>
            <button
              onClick={() => {
                const testWorkflow = [
                  {
                    id: 'step1',
                    title: 'Step 1',
                    stepType: 'Information',
                    role: 'Student'
                  },
                  {
                    id: 'step2',
                    title: 'Parent Step with Feedback',
                    stepType: 'Approval',
                    role: 'College',
                    feedbackLoops: {
                      'feedback1': { id: 'feedback1', title: 'Feedback Loop 1' },
                      'feedback2': { id: 'feedback2', title: 'Feedback Loop 2' }
                    }
                  },
                  {
                    id: 'feedback1_step',
                    title: 'Feedback Step 1',
                    stepType: 'Upload',
                    role: 'Student',
                    isFeedbackStep: true,
                    feedbackRelationship: {
                      parentStepId: 'step2',
                      feedbackId: 'feedback1'
                    }
                  },
                  {
                    id: 'feedback2_step',
                    title: 'Feedback Step 2',
                    stepType: 'Information',
                    role: 'Student',
                    isFeedbackStep: true,
                    feedbackRelationship: {
                      parentStepId: 'step2',
                      feedbackId: 'feedback2'
                    }
                  },
                  {
                    id: 'step3',
                    title: 'Step 3',
                    stepType: 'Upload',
                    role: 'College'
                  }
                ];
                
                window.testWorkflowState.scenarios.main.steps = testWorkflow;
                window.testWorkflowState.updateUI();
              }}
            >
              Load Test Workflow
            </button>
            <button
              onClick={() => {
                console.log('Current workflow state:', window.testWorkflowState);
              }}
            >
              Log State
            </button>
          </div>
        )}
        
        <WorkflowBuilder 
          initialState={testState?.scenarios}
          initialActiveScenarioId={testState?.activeScenarioId}
        />
      </main>
    </div>
  );
}

export default TestApp;
