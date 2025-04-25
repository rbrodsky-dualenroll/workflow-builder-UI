import React, { useState } from 'react';
import CollapsibleCard from '../../common/CollapsibleCard';

/**
 * Standard table columns in DualEnroll with their display labels and field values
 * Ensure all field values map to valid Ruby model paths in the view templates
 */
const STANDARD_TABLE_COLUMNS = [
  { value: 'target.student.display_name', label: 'Student Name' },
  { value: 'course.number', label: 'Course Number' },
  { value: 'course.title', label: 'Course Title' },
  { value: 'course_section.number', label: 'CRN' },
  { value: 'course_section.section_number', label: 'Section' },
  { value: 'course_section.instructor.name', label: 'Instructor' },
  { value: 'term.name', label: 'Term' },
  { value: 'course.credits', label: 'Credits' },
  { value: 'registration_status', label: 'Status' },
  { value: 'target.high_school.name', label: 'High School' },
  { value: 'fields.hold_names', label: 'Hold Names' },
  { value: 'fields.messages', label: 'Messages' },
  { value: 'fee.pretty_fee_amount', label: 'Fee Amount' },
  { value: 'fields.payment_status', label: 'Payment Status' },
  { value: 'fields.grade', label: 'Grade' },
  { value: 'target.student.email', label: 'Student Email' },
  { value: 'target.student.phone', label: 'Student Phone' },
  { value: 'custom', label: 'Custom Field' }
];

/**
 * Table columns section for step forms
 */
const TableColumnsSection = ({ formData, setFormData, errors = {} }) => {
  const [selectedColumn, setSelectedColumn] = useState('');
  const [customColumnName, setCustomColumnName] = useState('');
  const [customColumnCode, setCustomColumnCode] = useState('');
  const [showCustomField, setShowCustomField] = useState(false);

  // Handle adding a standard table column
  const addTableColumn = () => {
    if (!selectedColumn) return;
    
    // Get the selected column definition
    const selectedColumnObj = STANDARD_TABLE_COLUMNS.find(col => col.value === selectedColumn);
    
    if (!selectedColumnObj) return;
    
    // For custom field, use the custom name and code
    let newColumn = selectedColumnObj;
    if (selectedColumnObj.value === 'custom') {
      if (!customColumnName.trim()) return;
      newColumn = { 
        value: customColumnCode.trim() ? customColumnCode : 'custom',
        label: 'Custom Field',
        displayValue: customColumnName,
        customField: true
      };
    }
    
    // Check if this column is already in the table
    const hasColumn = (formData.tableColumns || []).some(col => 
      typeof col === 'object' ? col.value === newColumn.value : col === newColumn.label
    );
    
    if (!hasColumn) {
      // Add the new column
      setFormData({
        ...formData,
        tableColumns: [
          ...(formData.tableColumns || []), 
          { 
            value: newColumn.value, 
            label: newColumn.label,
            displayValue: newColumn.displayValue || newColumn.label,
            customField: newColumn.customField || false
          }
        ]
      });
    }
    
    // Reset the form
    setSelectedColumn('');
    setCustomColumnName('');
    setCustomColumnCode('');
    setShowCustomField(false);
  };

  // Remove a table column
  const removeTableColumn = (index) => {
    const updatedColumns = [...(formData.tableColumns || [])];
    updatedColumns.splice(index, 1);
    setFormData({
      ...formData,
      tableColumns: updatedColumns
    });
  };

  // Handle change in selected column
  const handleColumnSelectChange = (e) => {
    const value = e.target.value;
    setSelectedColumn(value);
    setShowCustomField(value === 'custom');
  };

  // Convert legacy format to new format if needed
  React.useEffect(() => {
    if (formData.tableColumns && formData.tableColumns.length > 0 && typeof formData.tableColumns[0] === 'string') {
      // Convert string-based columns to object-based format
      const updatedColumns = formData.tableColumns.map(column => {
        // Try to find a matching standard column
        const standardColumn = STANDARD_TABLE_COLUMNS.find(
          std => std.label.toLowerCase() === column.toLowerCase()
        );
        
        if (standardColumn) {
          return {
            value: standardColumn.value,
            label: standardColumn.label,
            displayValue: column // Keep the original display value
          };
        }
        
        // If no match, treat as custom column
        return {
          value: 'custom',
          label: 'Custom Field',
          displayValue: column,
          customField: true
        };
      });
      
      setFormData({
        ...formData,
        tableColumns: updatedColumns
      });
    }
  }, []);

  return (
    <CollapsibleCard 
      title="Table Columns" 
      className="bg-white mb-6" 
      defaultCollapsed={true}
      data-testid="table-columns-section"
    >
      <p className="text-sm text-gray-600 mb-3" data-testid="table-columns-intro">
        Define what information columns will appear in the step table. These columns will be used in the view template to display data from the DualEnroll system.
      </p>
      
      <div className="space-y-2 mb-4" data-testid="existing-table-columns">
        {(formData.tableColumns || []).map((column, index) => (
          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md border border-gray-200" data-testid={`table-column-${index}`} data-column-index={index}>
            <span className="text-sm">
              {typeof column === 'string' ? column : column.displayValue || column.label}
              {typeof column === 'object' && !column.customField && (
                <span className="text-xs text-gray-500 ml-2">({column.value})</span>
              )}
              {typeof column === 'object' && column.customField && column.value !== 'custom' && (
                <span className="text-xs text-gray-500 ml-2">(Ruby: {column.value})</span>
              )}
            </span>
            <button 
              type="button" 
              onClick={() => removeTableColumn(index)}
              className="text-red-500 hover:bg-red-50 p-1 rounded"
              data-testid={`remove-column-${index}`}
              data-action="remove-column"
              data-column-index={index}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2" data-testid="add-column-form">
        <div>
          <select
            value={selectedColumn}
            onChange={handleColumnSelectChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            data-testid="column-select"
          >
            <option value="">Select a column type</option>
            {STANDARD_TABLE_COLUMNS.map((column) => (
              <option key={column.value} value={column.value}>
                {column.label}
              </option>
            ))}
          </select>
        </div>
        
        {showCustomField && (
          <div>
            <input
              type="text"
              value={customColumnName}
              onChange={(e) => setCustomColumnName(e.target.value)}
              placeholder="Display Label (e.g., Student GPA)"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              data-testid="custom-column-input"
            />
          </div>
        )}
        
        {showCustomField && (
          <div className="col-span-1 md:col-span-2">
            <input
              type="text"
              value={customColumnCode}
              onChange={(e) => setCustomColumnCode(e.target.value)}
              placeholder="Ruby Code (e.g., target.student.gpa) - Optional"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              data-testid="custom-column-code-input"
            />
          </div>
        )}
        
        <div className={showCustomField ? "col-span-1 md:col-span-2" : "col-span-1"}>
          <button 
            type="button" 
            onClick={addTableColumn}
            className="bg-secondary hover:bg-secondary-600 text-white rounded-md px-3 py-2 text-sm w-full"
            data-testid="add-column-button"
            data-action="add-column"
            disabled={!selectedColumn || (selectedColumn === 'custom' && !customColumnName)}
          >
            Add Column
          </button>
        </div>
      </div>
      
      <p className="mt-2 text-xs text-gray-500">
        Select standard column types to display data from the DualEnroll system. For custom fields, you can optionally specify the Ruby code accessor to use in the view template.
      </p>
    </CollapsibleCard>
  );
};

export default TableColumnsSection;
