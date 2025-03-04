import { useState, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';

const WorkflowStep = ({ step, index, onEdit, onDelete, moveStep }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStepTypeColor = () => {
    switch (step.stepType) {
      case 'Approval': return 'border-primary';
      case 'Upload': return 'border-secondary';
      case 'Information': return 'border-yellow-400';
      case 'ProvideConsent': return 'border-green-500';
      case 'CheckHolds': return 'border-orange-500';
      case 'RegisterViaApi': return 'border-purple-500';
      case 'ResolveIssue': return 'border-red-500';
      default: return 'border-gray-400';
    }
  };

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

  const renderApprovalStep = () => {
    // Generate some placeholder data for the table
    const placeholder = {
      studentName: "Shelby Hyatt",
      courseNumber: "Architectural Technology 342",
      crn: "4857",
      instructor: "Dr. Johnson"
    };

    // Get column count - tableColumns plus one for the action column
    const columnCount = (step.tableColumns?.length || 4) + 1;
    const gridColsClass = `grid-cols-${columnCount}`;

    return (
      <div className="workflow-step-preview bg-white rounded border border-gray-200">
        <div className="p-4">
          <h3 className="text-lg font-bold mb-3">{step.role}: {step.title || 'Confirm Course'}</h3>
          
          <div className="border border-dashed border-gray-300 rounded-md p-5 mb-4">
            {step.description && (
              <p className="text-gray-700 mb-4">{step.description}</p>
            )}
            
            {/* Information Table */}
            <div className="mb-4">
              {/* Table Header */}
              <div className={`grid ${gridColsClass} gap-0`}>
                <div className="bg-gray-600 p-2"></div>
                {(step.tableColumns || ['Student Name', 'Course Number', 'CRN', 'Instructor']).map((column, index) => (
                  <div key={index} className="bg-gray-600 text-white p-2 font-medium text-center">
                    {column}
                  </div>
                ))}
              </div>
              
              {/* Table Row */}
              <div className={`grid ${gridColsClass} gap-0 bg-gray-100`}>
                <div className="p-3 border-r border-gray-300">
                  {/* Action Options as Radio Buttons */}
                  <div className="space-y-2">
                    {step.actionOptions && step.actionOptions.map((option, idx) => (
                      <div key={idx} className="flex items-center">
                        <input 
                          type="radio" 
                          id={`option-${idx}`} 
                          name="actionOption" 
                          className="h-4 w-4"
                        />
                        <label htmlFor={`option-${idx}`} className="ml-2">
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                {(step.tableColumns || ['Student Name', 'Course Number', 'CRN', 'Instructor']).map((column, index) => {
                  // Comprehensive sample data for placeholders
                  const placeholderData = {
                    'Student Name': 'Shelby Hyatt',
                    'Course Number': 'MATH 101',
                    'Course Title': 'Introduction to Statistics',
                    'CRN': '4857',
                    'Section': 'A01',
                    'Instructor': 'Dr. Johnson',
                    'Term': 'Fall 2023',
                    'Credits': '3',
                    'Status': 'Pending',
                    'High School': 'Lincoln High School',
                    'Hold Names': 'Financial Hold, Orientation Required',
                    'Messages': 'Must resolve holds before registration',
                    'Fee Amount': '$350.00',
                    'Payment Status': 'Unpaid',
                    'Grade': 'N/A'
                  };
                  
                  return (
                    <div key={index} className="p-3 text-center">
                      {placeholderData[column] || `Sample ${column}`}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {step.comments && step.comments.required && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
                <div className="border border-gray-300 rounded-md p-3 bg-white text-gray-400 text-sm">
                  Note: comments entered here will be communicated to the student and will be visible to other participants.
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-center">
            <button className="bg-primary text-white font-medium py-2 px-4 rounded-md text-sm uppercase">
              COMPLETE STEP
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderUploadStep = () => {
    return (
      <div className="workflow-step-preview bg-white rounded border border-gray-200">
        <div className="p-4">
          <h3 className="text-lg font-bold mb-3">{step.role}: {step.title || 'Document Upload'}</h3>
          
          <div className="border border-dashed border-gray-300 rounded-md p-5 mb-4">
            {step.description && (
              <p className="text-gray-700 mb-4">{step.description}</p>
            )}
            
            {step.fileUploads && step.fileUploads.length > 0 && (
              <div>
                <div className="mb-4">
                  {step.fileUploads.map((file, idx) => (
                    <div key={idx} className="mb-3">
                      <h4 className="font-medium mb-1">{file.label}</h4>
                      <div className="border border-gray-300 rounded-md p-3 bg-gray-50 flex items-center">
                        <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded mr-3 text-sm">
                          Choose File
                        </button>
                        <span className="text-gray-500 text-sm">No file chosen</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Accepted formats: {file.fileType}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {step.comments && step.comments.required && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
                <div className="border border-gray-300 rounded-md p-3 bg-white text-gray-400 text-sm">
                  Note: comments entered here will be communicated to the student and will be visible to other participants.
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-center">
            <button className="bg-primary text-white font-medium py-2 px-4 rounded-md text-sm uppercase">
              COMPLETE STEP
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderInformationStep = () => {
    return (
      <div className="workflow-step-preview bg-white rounded border border-gray-200">
        <div className="p-4">
          <h3 className="text-lg font-bold mb-3">{step.role}: {step.title || 'Information'}</h3>
          
          <div className="border border-dashed border-gray-300 rounded-md p-5 mb-4">
            {step.description && (
              <p className="text-gray-700 mb-4">{step.description}</p>
            )}
            
            {step.informationDisplays && step.informationDisplays.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                {step.informationDisplays.map((info, idx) => (
                  <p key={idx} className="mb-2 last:mb-0">{info}</p>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-center">
            <button className="bg-primary text-white font-medium py-2 px-4 rounded-md text-sm uppercase">
              COMPLETE STEP
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderProvideConsentStep = () => {
    return (
      <div className="workflow-step-preview bg-white rounded border border-gray-200">
        <div className="p-4">
          <h3 className="text-lg font-bold mb-3">{step.role}: {step.title || 'Provide Consent'}</h3>
          
          <div className="border border-dashed border-gray-300 rounded-md p-5 mb-4">
            {step.description && (
              <p className="text-gray-700 mb-4">{step.description}</p>
            )}
            
            <div className="bg-gray-50 border border-gray-300 rounded-md p-4 mb-4">
              <h4 className="font-medium mb-2">Consent Required</h4>
              <p className="text-sm text-gray-700 mb-4">
                By checking the box below, I consent to my student's enrollment in dual credit courses. I understand the academic implications of enrolling in college-level coursework.
              </p>
              
              <div className="flex items-center mb-2">
                <input type="checkbox" id="consent" className="h-4 w-4 text-primary focus:ring-primary" />
                <label htmlFor="consent" className="ml-2 text-sm font-medium">I consent to my student's enrollment</label>
              </div>
            </div>
            
            {step.comments && step.comments.required && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
                <div className="border border-gray-300 rounded-md p-3 bg-white text-gray-400 text-sm">
                  Note: comments entered here will be communicated to the student and will be visible to other participants.
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-center">
            <button className="bg-primary text-white font-medium py-2 px-4 rounded-md text-sm uppercase">
              COMPLETE STEP
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  const renderCheckHoldsStep = () => {
    // Sample data for placeholders
    const placeholderData = {
      'Hold Names': 'Financial Hold, Orientation Required',
      'Messages': 'Must resolve holds before registration',
      'Student Name': 'Shelby Hyatt',
      'Section': 'A01',
      'Grade': 'N/A'
    };
    
    // Get the column names from the step or use defaults
    const columnNames = step.tableColumns || ['Hold Names', 'Messages', 'Student Name', 'Section', 'Grade'];
    
    return (
      <div className="workflow-step-preview bg-white rounded border border-gray-200">
        <div className="p-4">
          <h3 className="text-lg font-bold mb-3">{step.role}: {step.title || 'Resolve holds'}</h3>
          
          <div className="border border-dashed border-gray-300 rounded-md p-5 mb-4">
            {step.description && (
              <p className="text-gray-700 mb-4">{step.description}</p>
            )}
            
            <div className="bg-gray-50 border border-gray-300 rounded-md p-4 mb-4">
              <h4 className="font-medium mb-2">Student Hold Check</h4>
              <p className="text-sm text-gray-700 mb-4">
                This student has the following holds: {'{HOLDS LISTED}'}
              </p>
              
              {/* Table with header column and data column */}
              <div className="mb-4">
                {/* Action buttons */}
                <div className="mb-2">
                  <div className="bg-gray-100 p-3 rounded-md">
                    <div className="flex items-center mb-2">
                      <input type="radio" id="proceed" name="holdAction" className="h-4 w-4" />
                      <label htmlFor="proceed" className="ml-2 text-sm">Proceed Anyway</label>
                    </div>
                    <div className="flex items-center">
                      <input type="radio" id="retry" name="holdAction" className="h-4 w-4" />
                      <label htmlFor="retry" className="ml-2 text-sm">Retry</label>
                    </div>
                  </div>
                </div>

                {/* Header row */}
                <div className="bg-gray-600 p-2 text-white font-medium text-center mb-px">
                  {columnNames[0] || 'Hold Names'}
                </div>
                
                {/* Data row 1 */}
                <div className="bg-gray-100 p-3 text-center mb-2">
                  {placeholderData[columnNames[0]] || `Financial Hold, Orientation Required`}
                </div>
                
                {/* Additional column pairs */}
                {columnNames.slice(1).map((column, index) => (
                  <div key={index}>
                    <div className="bg-gray-600 p-2 text-white font-medium text-center mb-px">
                      {column}
                    </div>
                    <div className="bg-gray-100 p-3 text-center mb-2">
                      {placeholderData[column] || `Sample ${column}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {step.comments && step.comments.required && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
                <div className="border border-gray-300 rounded-md p-3 bg-white text-gray-400 text-sm">
                  Please provide any additional information about this decision.
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-center">
            <button className="bg-primary text-white font-medium py-2 px-4 rounded-md text-sm uppercase">
              COMPLETE STEP
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  const renderRegisterViaApiStep = () => {
    return (
      <div className="workflow-step-preview bg-white rounded border border-gray-200">
        <div className="p-4">
          <h3 className="text-lg font-bold mb-3">{step.role}: {step.title || 'Register Via API'}</h3>
          
          <div className="border border-dashed border-gray-300 rounded-md p-5 mb-4">
            {step.description && (
              <p className="text-gray-700 mb-4">{step.description}</p>
            )}
            
            <div className="bg-gray-50 border border-gray-300 rounded-md p-4 mb-4">
              <h4 className="font-medium mb-2">API Registration</h4>
              <p className="text-sm text-gray-700">
                The system will automatically register the student through the {step.apiEndpoint || 'selected'} API integration.
              </p>
              
              <div className="mt-4 p-3 bg-gray-100 rounded-md">
                <p className="text-xs text-gray-500">This step is processed automatically by the system.</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <button className="bg-gray-400 text-white font-medium py-2 px-4 rounded-md text-sm uppercase" disabled>
              SYSTEM PROCESSED
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  const renderResolveIssueStep = () => {
    return (
      <div className="workflow-step-preview bg-white rounded border border-gray-200">
        <div className="p-4">
          <h3 className="text-lg font-bold mb-3">{step.role}: {step.title || 'Resolve Issue'}</h3>
          
          <div className="border border-dashed border-gray-300 rounded-md p-5 mb-4">
            {step.description && (
              <p className="text-gray-700 mb-4">{step.description}</p>
            )}
            
            <div className="bg-gray-50 border border-gray-300 rounded-md p-4 mb-4">
              <h4 className="font-medium mb-2">Issue Resolution</h4>
              <p className="text-sm text-gray-700 mb-3">
                Please address the following issue: {step.issueType || 'Registration Issue'}
              </p>
              
              {step.fileUploads && step.fileUploads.length > 0 ? (
                <div className="mt-4">
                  <h5 className="text-sm font-medium mb-2">Supporting Documents:</h5>
                  {step.fileUploads.map((file, idx) => (
                    <div key={idx} className="mb-2">
                      <div className="border border-gray-300 rounded-md p-2 bg-white flex items-center">
                        <button className="bg-gray-200 text-gray-800 px-2 py-1 rounded mr-2 text-xs">
                          Choose File
                        </button>
                        <span className="text-gray-500 text-xs">No file chosen</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
            
            {step.actionOptions && step.actionOptions.length > 0 ? (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Resolution Options:</h4>
                <div className="space-y-2">
                  {step.actionOptions.map((option, idx) => (
                    <div key={idx} className="flex items-center">
                      <input 
                        type="radio" 
                        id={`option-${idx}`} 
                        name="actionOption" 
                        className="h-4 w-4"
                      />
                      <label htmlFor={`option-${idx}`} className="ml-2 text-sm">
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Resolution Options:</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input type="radio" id="resolved" name="resolution" className="h-4 w-4" />
                    <label htmlFor="resolved" className="ml-2 text-sm">Issue Resolved</label>
                  </div>
                  <div className="flex items-center">
                    <input type="radio" id="unresolved" name="resolution" className="h-4 w-4" />
                    <label htmlFor="unresolved" className="ml-2 text-sm">Issue Cannot Be Resolved</label>
                  </div>
                </div>
              </div>
            )}
            
            {step.comments && step.comments.required && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
                <div className="border border-gray-300 rounded-md p-3 bg-white text-gray-400 text-sm">
                  Please explain how the issue was resolved or why it cannot be resolved.
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-center">
            <button className="bg-primary text-white font-medium py-2 px-4 rounded-md text-sm uppercase">
              COMPLETE STEP
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderStepPreview = () => {
    switch (step.stepType) {
      case 'Approval':
        return renderApprovalStep();
      case 'Upload':
        return renderUploadStep();
      case 'Information':
        return renderInformationStep();
      case 'ProvideConsent':
        return renderProvideConsentStep();
      case 'CheckHolds':
        return renderCheckHoldsStep();
      case 'RegisterViaApi':
        return renderRegisterViaApiStep();
      case 'ResolveIssue':
        return renderResolveIssueStep();
      default:
        return <p>Unknown step type</p>;
    }
  };

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
      <div className={`flex border-l-4 ${getStepTypeColor()} bg-white shadow-sm`}>
        <div className="step-header flex-grow">
          <div className="step-number">{index + 1}</div>
          <div className="flex items-center">
            <div className="step-type font-medium">
              {step.role ? `${step.role}: ` : ''}
              {step.title || `${step.stepType} Step`}
            </div>
            {getSubworkflowBadge()}
          </div>
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
            onClick={() => onDelete(step.id)} 
            className="text-red-500 hover:bg-red-50 p-1.5 rounded" 
            title="Delete Step"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-4 border-t border-gray-200">
          {renderStepPreview()}
        </div>
      )}
    </div>
  );
};

export default WorkflowStep;
