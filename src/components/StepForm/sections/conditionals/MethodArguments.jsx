import React, { useState } from 'react';

/**
 * Component for managing arguments for a method in a conditional
 */
const MethodArguments = ({ 
  args = [], 
  onChange 
}) => {
  const [newArg, setNewArg] = useState('');
  
  // Add a new argument
  const handleAddArg = () => {
    if (!newArg.trim()) return;
    
    const updatedArgs = [...args, newArg.trim()];
    onChange(updatedArgs);
    setNewArg('');
  };
  
  // Remove an argument at specified index
  const handleRemoveArg = (index) => {
    const updatedArgs = args.filter((_, i) => i !== index);
    onChange(updatedArgs);
  };
  
  // Handle keydown to add arg on Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddArg();
    }
  };
  
  return (
    <div className="mt-3">
      <h5 className="text-sm font-medium mb-2">Method Arguments (Optional)</h5>
      
      {/* Arguments list */}
      {args.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {args.map((arg, index) => (
            <div 
              key={index} 
              className="flex items-center bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded"
            >
              <span className="mr-1">{arg}</span>
              <button
                type="button"
                onClick={() => handleRemoveArg(index)}
                className="text-blue-500 hover:text-blue-700"
                aria-label="Remove argument"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Add argument input */}
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
          placeholder="Add argument (e.g. 'college', '2023-01-01')"
          value={newArg}
          onChange={(e) => setNewArg(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button 
          type="button"
          onClick={handleAddArg}
          className="bg-blue-100 text-blue-700 px-3 py-1 rounded border border-blue-300 text-sm hover:bg-blue-200"
        >
          Add
        </button>
      </div>
      
      {args.length > 0 && (
        <div className="mt-1 text-xs text-gray-500">
          <p>Arguments will be passed to the method in the order listed.</p>
        </div>
      )}
    </div>
  );
};

export default MethodArguments;
