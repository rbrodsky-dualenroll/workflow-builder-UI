import { useState, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import StepHeader from './StepHeader';
import StepPreview from './StepPreview';

/**
 * Main workflow step component that handles drag & drop functionality
 */
const WorkflowStep = ({ step, index, onEdit, onDelete, moveStep }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if this step is part of a conditional scenario in master view
  const isConditionalStep = step.conditional || (step.scenarioId && step.scenarioId !== 'main');

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
      const dragIndex = item.index;
      const hoverIndex = index;
      
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) return;
      
      // Calculate position of the hovering item
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
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
    item: () => ({ id: step.id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  
  // Apply the drag and drop refs to the element
  drag(drop(ref));

  return (
    <div 
      ref={ref} 
      className={`workflow-step ${step.stepType?.toLowerCase() || ''} ${isDragging ? 'opacity-50' : ''}`}
      data-handler-id={handlerId}
    >
      <StepHeader 
        step={step} 
        index={index} 
        onEdit={onEdit} 
        onDelete={() => onDelete(step.id)} 
        isExpanded={isExpanded} 
        setIsExpanded={setIsExpanded}
        isConditionalStep={isConditionalStep} 
      />
      
      {isExpanded && <StepPreview step={step} />}
    </div>
  );
};

export default WorkflowStep;
