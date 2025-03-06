import React, { useState } from 'react';
import Card from '../../common/Card';
import FormField from '../../common/FormField';

/**
 * FeedbackLoopsSection component for managing multiple feedback loops
 */
const FeedbackLoopsSection = ({ formData, setFormData, onAddFeedbackStep }) => {
  const [newFeedback, setNewFeedback] = useState({
    recipient: '',
    nextStep: ''
  });
  
  // Track pending feedback steps that need to be created when the parent step is saved
  const [pendingFeedbackSteps, setPendingFeedbackSteps] = useState([]);
  
  // Available recipient roles
  const recipientOptions = [
    { value: 'Student', label: 'Student' },
    { value: 'High School', label: 'High School' },
    { value: 'College', label: 'College' },
    { value: 'Approver', label: 'Approver' },
  ];
  
  // Add a new feedback loop
  const addFeedbackLoop = () => {
    if (!newFeedback.recipient || !newFeedback.nextStep.trim()) {
      return; // Don't add empty feedback loops
    }
    
    // Create a unique ID for the feedback loop
    const feedbackId = `feedback_${Date.now()}`;
    
    // Add the feedback step data to the pending list
    const newFeedbackStep = {
      stepType: 'Information',
      title: newFeedback.nextStep.trim(),
      role: newFeedback.recipient,
      description: `Additional information step created for feedback from ${formData.title || 'previous step'}`,
      informationDisplays: [
        { content: 'Please provide additional information to continue the process.' }
      ]
    };
    
    // Store this feedback step for later creation
    setPendingFeedbackSteps([...pendingFeedbackSteps, newFeedbackStep]);
    
    // Track pending feedback steps in formData so they get submitted with the form
    setFormData({
      ...formData,
      pendingFeedbackSteps: [...(formData.pendingFeedbackSteps || []), newFeedbackStep],
      feedbackLoops: {
        ...(formData.feedbackLoops || {}),
        [feedbackId]: {
          recipient: newFeedback.recipient,
          nextStep: newFeedback.nextStep.trim()
        }
      }
    });
    
    // Reset the new feedback form
    setNewFeedback({
      recipient: '',
      nextStep: ''
    });
  };
  
  // Remove a feedback loop
  const removeFeedbackLoop = (feedbackId) => {
    const updatedFeedbackLoops = { ...(formData.feedbackLoops || {}) };
    delete updatedFeedbackLoops[feedbackId];
    
    setFormData({
      ...formData,
      feedbackLoops: updatedFeedbackLoops
    });
  };
  
  // Get all feedback loops as an array for display
  const feedbackLoops = Object.entries(formData.feedbackLoops || {}).map(
    ([id, data]) => ({ id, ...data })
  );
  
  return (
    <Card title="Feedback Loops" className="bg-white mb-6">
      <p className="text-sm text-gray-600 mb-3">
        Create information steps that will be triggered when specific conditions are met
      </p>
      
      {/* List of existing feedback loops */}
      {feedbackLoops.length > 0 && (
        <div className="space-y-2 mb-4">
          {feedbackLoops.map((feedback) => (
            <div 
              key={feedback.id} 
              className="flex items-center justify-between bg-gray-50 p-3 rounded-md border border-gray-200"
            >
              <div>
                <span className="font-medium">Send to: </span>
                <span className="text-primary">{feedback.recipient}</span>
                <span className="mx-2">→</span>
                <span className="font-medium">Step name: </span>
                <span className="text-primary">{feedback.nextStep}</span>
              </div>
              <button 
                type="button" 
                onClick={() => removeFeedbackLoop(feedback.id)}
                className="text-red-500 hover:bg-red-50 p-1 rounded"
                aria-label="Remove feedback loop"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Form for adding a new feedback loop */}
      <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
          <FormField
            label="Send feedback to"
            name="recipient"
            type="select"
            value={newFeedback.recipient}
            onChange={(e) => setNewFeedback({ ...newFeedback, recipient: e.target.value })}
            options={[
              { value: '', label: 'Select recipient...' }, 
              ...recipientOptions
            ]}
          />
          
          <FormField
            label="Feedback Step Name"
            name="nextStep"
            type="text"
            value={newFeedback.nextStep}
            onChange={(e) => setNewFeedback({ ...newFeedback, nextStep: e.target.value })}
            placeholder="Enter step name (e.g., Provide Additional Information)"
          />
        </div>
        
        <div className="flex justify-end">
          <button 
            type="button" 
            onClick={addFeedbackLoop}
            disabled={!newFeedback.recipient || !newFeedback.nextStep.trim()}
            className="bg-primary hover:bg-primary-600 text-white rounded-md px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Feedback Loop
          </button>
        </div>
      </div>
      
      <div className="mt-3 text-xs text-gray-500">
        <p>
          Adding a feedback loop will automatically create an Information step with the specified name.
          This step will be assigned to the selected role.
        </p>
      </div>
    </Card>
  );
};

export default FeedbackLoopsSection;
