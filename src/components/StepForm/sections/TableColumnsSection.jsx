import React, { useState } from 'react';
import CollapsibleCard from '../../common/CollapsibleCard';

/**
 * Table columns section for step forms
 */
const TableColumnsSection = ({ formData, setFormData, errors = {} }) => {
  const [tempTableColumn, setTempTableColumn] = useState('');
  const [showTableColumnTemplates, setShowTableColumnTemplates] = useState(false);

  // Template data for common table columns
  const commonTableColumns = [
    'Student Name', 
    'Course Number', 
    'Course Title',
    'CRN', 
    'Section',
    'Instructor',
    'Term',
    'Credits',
    'Status',
    'High School',
    'Hold Names',
    'Messages',
    'Fee Amount',
    'Payment Status',
    'Grade'
  ];

  const addTableColumn = () => {
    if (tempTableColumn.trim() === '') return;
    
    setFormData({
      ...formData,
      tableColumns: [...(formData.tableColumns || []), tempTableColumn]
    });
    setTempTableColumn('');
  };

  const removeTableColumn = (index) => {
    const updatedColumns = [...(formData.tableColumns || [])];
    updatedColumns.splice(index, 1);
    setFormData({
      ...formData,
      tableColumns: updatedColumns
    });
  };

  const addCommonTableColumn = (column) => {
    if (!(formData.tableColumns || []).includes(column)) {
      setFormData({
        ...formData,
        tableColumns: [...(formData.tableColumns || []), column]
      });
    }
  };

  return (
    <CollapsibleCard 
      title="Table Columns" 
      className="bg-white mb-6" 
      defaultCollapsed={true}
      id="table-columns-section"
    >
      <p className="text-sm text-gray-600 mb-3">Define what information columns will appear in the step table:</p>
      
      <div className="space-y-2 mb-4">
        {(formData.tableColumns || []).map((column, index) => (
          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md border border-gray-200">
            <span className="text-sm">{column}</span>
            <button 
              type="button" 
              onClick={() => removeTableColumn(index)}
              className="text-red-500 hover:bg-red-50 p-1 rounded"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}
      </div>
      
      <div className="mb-4">
        <button
          type="button"
          onClick={() => setShowTableColumnTemplates(!showTableColumnTemplates)}
          className="text-primary bg-white text-sm flex items-center border border-gray-200 px-3 py-1 rounded"
        >
          {showTableColumnTemplates ? 'Hide' : 'Show'} common table columns
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1 transform ${showTableColumnTemplates ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        
        {showTableColumnTemplates && (
          <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {commonTableColumns.map((column, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => addCommonTableColumn(column)}
                  className="text-left text-sm px-2 py-1 rounded flex items-center text-primary bg-white"
                  disabled={(formData.tableColumns || []).includes(column)}
                >
                  <span className="w-4 h-4 mr-2 flex-shrink-0">+</span>
                  {column}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <input
          type="text"
          value={tempTableColumn}
          onChange={(e) => setTempTableColumn(e.target.value)}
          placeholder="New Column Name"
          className="col-span-3 rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <button 
          type="button" 
          onClick={addTableColumn}
          className="bg-secondary hover:bg-secondary-600 text-white rounded-md px-3 py-2 text-sm"
        >
          Add Column
        </button>
      </div>
    </CollapsibleCard>
  );
};

export default TableColumnsSection;
