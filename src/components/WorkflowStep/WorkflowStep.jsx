import { useState, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import StepHeader from './StepHeader';
import StepPreview from './StepPreview';
import './WorkflowStep.css'; // Import the CSS file we'll create

/**
 * Get color based on step type
 */
const getStepTypeColor = (stepType) => {
  switch (stepType) {
    case 'approval':
      return '#4ade80'; // green-400
    case 'upload':
      return '#3b82f6'; // blue-500
    case 'information':
      return '#f97316'; // orange-500
    default:
      return '#6b7280'; // gray-500
  }
};

/**
 * Main workflow step component that handles drag & drop functionality
 */
const WorkflowStep = ({ step, index, onEdit, onDelete, moveStep }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if this step is part of a scenario other than main
  const isConditionalStep = step.scenarioId && step.scenarioId !== 'main';
  
  // Get the scenario name for display if it's a non-main scenario
  const scenarioName = isConditionalStep ? (step.scenarioName || step.scenarioId) : null;
  
  // Check if this step has workflow conditions
  const hasWorkflowConditions = step.conditional && step.workflowCondition && step.workflowCondition.length > 0;
  
  // Check if this is a feedback step
  const isFeedbackStep = step.isFeedbackStep && step.feedbackRelationship;
  
  // Get the parent step type if this is a feedback step
  let parentStepColor = '';
  if (isFeedbackStep && step.stepType) {
    parentStepColor = getStepTypeColor(step.stepType.toLowerCase());
  }

  // Create a ref for the draggable element
  const ref = useRef(null);
  
  // Set up the drop target
  const [{ handlerId }, drop] = useDrop({
    accept: 'WORKFLOW_STEP',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item, monitor) {
      if (!ref.current) return;
      
      // Don't allow dropping onto feedback steps
      if (isFeedbackStep) return;
      
      const dragIndex = item.index;
      const hoverIndex = index;
      
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) return;
      
      // Calculate position of the hovering item
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
      
      // Time to actually perform the action
      moveStep(dragIndex, hoverIndex);
      
      // Update the index on the item
      item.index = hoverIndex;
    },
  });
  
  // Set up the drag source
  const [{ isDragging }, drag] = useDrag({
    type: 'WORKFLOW_STEP',
    item: () => ({
      id: step.id,
      index,
      isParent: !!(step.feedbackLoops && Object.keys(step.feedbackLoops).length > 0),
      isFeedbackStep: isFeedbackStep
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    // Complete prevention of dragging feedback steps
    canDrag: () => !isFeedbackStep
  });
  
  // Apply the drag and drop refs to the element
  drag(drop(ref));

  return (
    <div 
      ref={ref} 
      className={`
        workflow-step 
        ${step.stepType?.toLowerCase() || ''} 
        ${isDragging ? 'opacity-50' : ''}
        ${isFeedbackStep ? 'feedback-child' : ''}
      `}
      data-handler-id={handlerId}
      data-testid={`workflow-step-${step.id}`}
      data-step-id={step.id}
      data-step-type={step.stepType}
      data-is-feedback={isFeedbackStep ? 'true' : 'false'}
      data-parent-id={isFeedbackStep && step.feedbackRelationship ? step.feedbackRelationship.parentStepId : ''}
      data-step-index={index}
      data-drag-handle="true"
      data-has-feedback={step.feedbackLoops && Object.keys(step.feedbackLoops).length > 0 ? 'true' : 'false'}
      data-step-role={step.role || ''}
      data-scenario-id={step.scenarioId || ''}
      data-in-non-main-scenario={isConditionalStep ? 'true' : 'false'}
      style={{
        // Only add extra styling for feedback steps
        borderLeft: isFeedbackStep ? `4px solid ${parentStepColor}` : '',
        // Set a CSS variable for the connector styling
        '--parent-color': parentStepColor
      }}
    >
      <StepHeader 
        step={step} 
        index={index} 
        onEdit={onEdit} 
        onDelete={() => onDelete(step.id)} 
        isExpanded={isExpanded} 
        setIsExpanded={setIsExpanded}
        isConditionalStep={isConditionalStep}
        hasWorkflowConditions={hasWorkflowConditions}
        isFeedbackStep={isFeedbackStep}
        scenarioName={scenarioName}
      />
      
      {isExpanded && <StepPreview step={step} />}
    </div>
  );
};

export default WorkflowStep;
