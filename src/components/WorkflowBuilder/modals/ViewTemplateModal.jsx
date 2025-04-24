import React, { useState } from 'react';
import generateSingleViewTemplate from '../export/views/singleViewGenerator';
import getViewOverride from '../export/getViewOverride';

/**
 * Modal for displaying and copying a generated view template
 */
const ViewTemplateModal = ({ step, onClose }) => {
  const [copied, setCopied] = useState(false);
  
  // Generate the view template content
  const templateContent = generateSingleViewTemplate(step);
  
  // Get the view path for this step
  const viewPath = getViewOverride(step);
  
  // Create the full file path with underscore prefix for partial
  let filePath = 'No view path determined';
  
  if (viewPath) {
    // Parse the path to add underscore prefix to the file name
    const pathParts = viewPath.split('/');
    const fileName = pathParts.pop();
    const partialFileName = `_${fileName}.html.erb`;
    
    // Recreate path with proper partial naming
    const partialPath = [...pathParts, partialFileName].join('/');
    filePath = `app/views/${partialPath}`;
  }
  
  // Copy template to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(templateContent).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      (err) => {
        console.error('Could not copy text: ', err);
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">View Template Generator</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            data-testid="close-view-template-modal"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="px-6 py-4 flex-grow overflow-auto">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-700">File Path</h3>
            <div className="mt-1 p-3 bg-gray-50 rounded-md border border-gray-200 font-mono text-sm break-all">
              {filePath}
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-700">Template Content</h3>
              <button
                onClick={handleCopy}
                className={`
                  px-3 py-1 rounded-md text-sm font-medium
                  ${copied ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
                `}
                data-testid="copy-template-btn"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="mt-1 p-3 bg-gray-50 rounded-md border border-gray-200 font-mono text-sm overflow-auto max-h-96 whitespace-pre">
              {templateContent}
            </div>
          </div>
          
          <div className="bg-blue-50 text-blue-700 p-4 rounded-md">
            <h4 className="font-bold mb-2">Template Usage Instructions</h4>
            <ol className="list-decimal pl-5 space-y-2 text-sm">
              <li>Copy this template content.</li>
              <li>Create a new file at the path shown above.</li>
              <li>
                Note that Rails partial templates must begin with an underscore (_) 
                which is already included in the file path.
              </li>
              <li>
                Customize as needed to match your college's specific requirements 
                or add additional functionality.
              </li>
              <li>
                Ensure that any form fields or buttons in the template correctly 
                use the completion state values defined in your workflow step.
              </li>
            </ol>
          </div>
        </div>
        
        <div className="px-6 py-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            data-testid="close-btn"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewTemplateModal;
