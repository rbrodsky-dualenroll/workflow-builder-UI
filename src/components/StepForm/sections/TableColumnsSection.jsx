import React, { useState } from 'react';
import CollapsibleCard from '../../common/CollapsibleCard';

/**
 * Input field types for form fields
 */
const INPUT_FIELD_TYPES = [
  { value: 'text', label: 'Text Field' },
  { value: 'number', label: 'Number Field' },
  { value: 'select', label: 'Dropdown Select' },
  { value: 'radio', label: 'Radio Buttons' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'section_select', label: 'All Sections Selection' },
  { value: 'other_section_select', label: 'Other Sections Selection' }
];

/**
 * Standard table columns in DualEnroll with their display labels and field values
 * Ensure all field values map to valid Ruby model paths in the view templates
 */
const STANDARD_TABLE_COLUMNS = [
  { value: 'target.student.display_name', label: 'Student Name', type: 'display' },
  { value: 'course.number', label: 'Course Number', type: 'display' },
  { value: 'course.title', label: 'Course Title', type: 'display' },
  { value: 'course_section.number', label: 'CRN', type: 'display' },
  { value: 'course_section.section_number', label: 'Section', type: 'display' },
  { value: 'course_section.instructor.name', label: 'Instructor', type: 'display' },
  { value: 'term.name', label: 'Term', type: 'display' },
  { value: 'course.credits', label: 'Credits', type: 'display' },
  { value: 'registration_status', label: 'Status', type: 'display' },
  { value: 'target.high_school.name', label: 'High School', type: 'display' },
  { value: 'fields.hold_names', label: 'Hold Names', type: 'display' },
  { value: 'fields.messages', label: 'Messages', type: 'display' },
  { value: 'fee.pretty_fee_amount', label: 'Fee Amount', type: 'display' },
  { value: 'fields.payment_status', label: 'Payment Status', type: 'display' },
  { value: 'fields.grade', label: 'Grade', type: 'display' },
  { value: 'target.student.email', label: 'Student Email', type: 'display' },
  { value: 'target.student.phone', label: 'Student Phone', type: 'display' },
  // Input field columns
  { value: 'fields.student_number', label: 'Student ID Input', type: 'input', inputType: 'text', modelPath: 'college_student_application' },
  { value: 'fields.hs_gpa', label: 'GPA Input', type: 'input', inputType: 'number', modelPath: 'college_student_application',
    min: 0, max: 4, step: 0.1 },
  { value: 'fields.hs_current_grade', label: 'Grade Level Input', type: 'input', inputType: 'radio', modelPath: 'college_student_application',
    options: ['Freshman', 'Sophomore', 'Junior', 'Senior'] },
  { value: 'fields.counselor_provided_graduation_year', label: 'Graduation Year Input', type: 'input', inputType: 'number', modelPath: 'college_student_application',
    min: 2025, max: 2035, step: 1 },
  { value: 'fields.course_section_id', label: 'All Sections Selection', type: 'input', inputType: 'section_select', modelPath: 'student_de_course',
    description: 'Selectable radio buttons for all available course sections (including current selection)',
    isSpecialRender: true, // Flag to indicate special rendering in the view template
    sampleOptions: ['4857', '4858', '4859'] }, // Sample CRN options for preview
  { value: 'fields.course_section_id', label: 'Other Sections Selection', type: 'input', inputType: 'other_section_select', modelPath: 'student_de_course',
    description: 'Selectable radio buttons for alternative course sections (excluding current selection)',
    isSpecialRender: true, // Flag to indicate special rendering in the view template
    sampleOptions: ['4857', '4858', '4859'] }, // Sample CRN options for preview
  { value: 'custom', label: 'Custom Field' }
];

/**
 * Common model paths for update_attributes parameter
 */
const MODEL_PATHS = [
  { value: 'college_student_application', label: 'College Student Application' },
  { value: 'student_de_course', label: 'Student Course' },
  { value: 'student_term', label: 'Student Term' }
];


/**
 * Table columns section for step forms
 */
const TableColumnsSection = ({ formData, setFormData, errors = {} }) => {
  const [selectedColumn, setSelectedColumn] = useState('');
  const [customColumnName, setCustomColumnName] = useState('');
  const [customColumnCode, setCustomColumnCode] = useState('');
  const [showCustomField, setShowCustomField] = useState(false);
  const [showInputOptions, setShowInputOptions] = useState(false);
  const [inputType, setInputType] = useState('text');
  const [modelPath, setModelPath] = useState('');
  const [fieldOptions, setFieldOptions] = useState('');
  const [fieldMin, setFieldMin] = useState('');
  const [fieldMax, setFieldMax] = useState('');
  const [fieldStep, setFieldStep] = useState('');

  // Handle adding a standard table column
  const addTableColumn = () => {
    if (!selectedColumn) return;
    
    // Get the selected column definition
    const selectedColumnObj = STANDARD_TABLE_COLUMNS.find(col => col.value === selectedColumn);
    
    if (!selectedColumnObj) return;
    
    let newColumn = { ...selectedColumnObj };
    
    // For custom field, use the custom name and code
    if (selectedColumnObj.value === 'custom') {
      if (!customColumnName.trim()) return;
      
      // Determine if this is an input field
      if (showInputOptions && modelPath) {
        newColumn = {
          value: customColumnCode.trim() ? `fields.${customColumnCode}` : 'fields.custom_field',
          label: 'Custom Field',
          displayValue: customColumnName,
          customField: true,
          type: 'input',
          inputType: inputType,
          modelPath: modelPath
        };
        
        // Add additional properties based on input type
        if (inputType === 'number') {
          if (fieldMin) newColumn.min = parseFloat(fieldMin);
          if (fieldMax) newColumn.max = parseFloat(fieldMax);
          if (fieldStep) newColumn.step = parseFloat(fieldStep);
        }
        
        if (inputType === 'radio' || inputType === 'select') {
          newColumn.options = fieldOptions.split(',').map(opt => opt.trim()).filter(opt => opt);
        }
      } else {
        newColumn = { 
          value: customColumnCode.trim() ? customColumnCode : 'custom',
          label: 'Custom Field',
          displayValue: customColumnName,
          customField: true,
          type: 'display'
        };
      }
    }
    
    // For standard input fields, ensure all necessary properties are included
    if (newColumn.type === 'input' && !newColumn.customField) {
      // Make sure we're using the original properties
      const originalCol = STANDARD_TABLE_COLUMNS.find(col => col.value === selectedColumn);
      newColumn = { ...originalCol };
    }
    
    // Check if this column is already in the table
    const hasColumn = (formData.tableColumns || []).some(col => 
      typeof col === 'object' ? col.value === newColumn.value : col === newColumn.label
    );
    
    if (!hasColumn) {
      // Add the new column
      const updatedColumns = [...(formData.tableColumns || []), newColumn];
      
      // If we added an input field, also update the update_attributes in formData
      if (newColumn.type === 'input' && newColumn.modelPath && newColumn.value.startsWith('fields.')) {
        // Extract the field name without the fields. prefix
        const fieldName = newColumn.value.replace('fields.', '');
        
        // Get existing update_attributes or initialize if not present
        const updateAttributes = formData.updateAttributes || {};
        
        // Add this field to the appropriate model path
        updateAttributes[newColumn.modelPath] = [
          ...((updateAttributes[newColumn.modelPath] || []).filter(field => field !== fieldName)),
          fieldName
        ];
        
        // Update the form data with both new column and update_attributes
        setFormData({
          ...formData,
          tableColumns: updatedColumns,
          updateAttributes: updateAttributes
        });
      } else {
        // Just update the columns
        setFormData({
          ...formData,
          tableColumns: updatedColumns
        });
      }
    }
    
    // Reset the form
    setSelectedColumn('');
    setCustomColumnName('');
    setCustomColumnCode('');
    setShowCustomField(false);
    setShowInputOptions(false);
    setInputType('text');
    setModelPath('');
    setFieldOptions('');
    setFieldMin('');
    setFieldMax('');
    setFieldStep('');
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
    
    // Reset other fields when selection changes
    setShowCustomField(value === 'custom');
    
    // Check if the selected column is an input type
    const selectedColumnObj = STANDARD_TABLE_COLUMNS.find(col => col.value === value);
    if (selectedColumnObj && selectedColumnObj.type === 'input') {
      // Pre-populate input properties from the standard column
      setInputType(selectedColumnObj.inputType || 'text');
      setModelPath(selectedColumnObj.modelPath || '');
      setFieldMin(selectedColumnObj.min || '');
      setFieldMax(selectedColumnObj.max || '');
      setFieldStep(selectedColumnObj.step || '');
      setFieldOptions(selectedColumnObj.options ? selectedColumnObj.options.join(', ') : '');
    } else {
      // Reset input properties for non-input columns
      setShowInputOptions(false);
      setInputType('text');
      setModelPath('');
      setFieldOptions('');
      setFieldMin('');
      setFieldMax('');
      setFieldStep('');
    }
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
            <div className="flex-1">
              <div className="flex items-center">
                <span className="text-sm font-medium">
                  {typeof column === 'string' ? column : column.displayValue || column.label}
                </span>
                {typeof column === 'object' && column.type === 'input' && (
                  <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                    Input Field
                  </span>
                )}
              </div>
              
              {typeof column === 'object' && (
                <div className="text-xs text-gray-500 mt-1">
                  {column.type === 'display' && !column.customField && (
                    <>Ruby: {column.value}</>
                  )}
                  
                  {column.type === 'input' && column.inputType === 'section_select' && (
                    <>
                      Field: {column.value.replace('fields.', '')}, 
                      Type: All Sections Selection, 
                      Model: {column.modelPath || 'none'}
                      <span className="ml-2 text-xs px-1 py-0.5 bg-blue-100 text-blue-700 rounded">
                        Shows all sections, including current
                      </span>
                    </>
                  )}

                  {column.type === 'input' && column.inputType === 'other_section_select' && (
                    <>
                      Field: {column.value.replace('fields.', '')}, 
                      Type: Other Sections Selection, 
                      Model: {column.modelPath || 'none'}
                      <span className="ml-2 text-xs px-1 py-0.5 bg-blue-100 text-blue-700 rounded">
                        Shows only alternative sections
                      </span>
                    </>
                  )}
                  
                  {column.type === 'input' && column.inputType !== 'section_select' && column.inputType !== 'other_section_select' && (
                    <>
                      Field: {column.value.replace('fields.', '')}, 
                      Type: {column.inputType || 'text'}, 
                      Model: {column.modelPath || 'none'}
                      {column.inputType === 'number' && (
                        <>, Range: {column.min || '0'} to {column.max || '∞'}, Step: {column.step || '1'}</>
                      )}
                      {(column.inputType === 'radio' || column.inputType === 'select') && column.options && column.options.length > 0 && (
                        <>, Options: {column.options.join(', ')}</>
                      )}
                    </>
                  )}
                  
                  {column.customField && column.type === 'display' && column.value !== 'custom' && (
                    <>Ruby: {column.value}</>
                  )}
                </div>
              )}
            </div>
            <button 
              type="button" 
              onClick={() => removeTableColumn(index)}
              className="text-red-500 hover:bg-red-50 p-1 rounded flex-shrink-0"
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
        
        {showCustomField && (
          <div className="col-span-1 md:col-span-2 mt-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is-input-field"
                checked={showInputOptions}
                onChange={(e) => setShowInputOptions(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                data-testid="is-input-field-checkbox"
              />
              <label htmlFor="is-input-field" className="ml-2 text-sm text-gray-700">
                This is an input field (for user data entry)
              </label>
            </div>
          </div>
        )}
        
        {showCustomField && showInputOptions && (
          <div className="col-span-1 md:col-span-2 mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label htmlFor="input-field-type" className="block text-sm text-gray-700 mb-1">
                  Input Field Type
                </label>
                <select
                  id="input-field-type"
                  value={inputType}
                  onChange={(e) => setInputType(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm"
                  data-testid="input-field-type-select"
                >
                  {INPUT_FIELD_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="model-path" className="block text-sm text-gray-700 mb-1">
                  Model Path (for update_attributes)
                </label>
                <select
                  id="model-path"
                  value={modelPath}
                  onChange={(e) => setModelPath(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm"
                  data-testid="model-path-select"
                >
                  <option value="">Select Model</option>
                  {MODEL_PATHS.map(path => (
                    <option key={path.value} value={path.value}>{path.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {(inputType === 'radio' || inputType === 'select') && (
              <div>
                <label htmlFor="field-options" className="block text-sm text-gray-700 mb-1">
                  Options (comma separated)
                </label>
                <input
                  type="text"
                  id="field-options"
                  value={fieldOptions}
                  onChange={(e) => setFieldOptions(e.target.value)}
                  placeholder="e.g., Freshman, Sophomore, Junior, Senior"
                  className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm"
                  data-testid="field-options-input"
                />
              </div>
            )}
            
            {inputType === 'number' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label htmlFor="field-min" className="block text-sm text-gray-700 mb-1">
                    Min Value
                  </label>
                  <input
                    type="number"
                    id="field-min"
                    value={fieldMin}
                    onChange={(e) => setFieldMin(e.target.value)}
                    placeholder="e.g., 0"
                    className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm"
                    data-testid="field-min-input"
                  />
                </div>
                
                <div>
                  <label htmlFor="field-max" className="block text-sm text-gray-700 mb-1">
                    Max Value
                  </label>
                  <input
                    type="number"
                    id="field-max"
                    value={fieldMax}
                    onChange={(e) => setFieldMax(e.target.value)}
                    placeholder="e.g., 100"
                    className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm"
                    data-testid="field-max-input"
                  />
                </div>
                
                <div>
                  <label htmlFor="field-step" className="block text-sm text-gray-700 mb-1">
                    Step Value
                  </label>
                  <input
                    type="number"
                    id="field-step"
                    value={fieldStep}
                    onChange={(e) => setFieldStep(e.target.value)}
                    placeholder="e.g., 0.1"
                    className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm"
                    data-testid="field-step-input"
                  />
                </div>
              </div>
            )}
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
