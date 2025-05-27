import React from 'react';

/**
 * Reusable form field component
 */
const FormField = ({ 
  label, 
  name, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  options = [],
  required = false,
  error,
  helpText,
  className = '',
  children,
  'data-testid': customTestId
}) => {
  const renderField = () => {
    switch (type) {
      case 'text':
        return (
          <input
            id={name}
            name={name}
            type="text"
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            className={`w-full rounded-md border ${error ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
            required={required}
            data-testid={customTestId || `field-${name}`}
          />
        );
      case 'textarea':
        return (
          <textarea
            id={name}
            name={name}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            className={`w-full rounded-md border ${error ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
            required={required}
            rows={3}
          />
        );
      case 'select':
        return (
          <select
            id={name}
            name={name}
            value={value || ''}
            onChange={onChange}
            className={`w-full rounded-md border ${error ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
            required={required}
            data-testid={customTestId || `field-${name}`}
          >
            {options.map((option) => {
              const optionValue = typeof option === 'object' ? option.value : option;
              const optionLabel = typeof option === 'object' ? option.label : option;
              const optionType = name.includes('entity') ? 'entity' : 
                                name.includes('property') ? 'property' : 
                                name.includes('comparison') ? 'comparison' : '';
              
              let dataTestId = '';
              if (optionType === 'entity') {
                dataTestId = optionValue ? `entity-option-${optionValue}` : 'entity-option-empty';
              } else if (optionType === 'property') {
                const entityValue = value.split('-').pop();
                dataTestId = optionValue ? `property-option-${entityValue}-${optionValue}` : 'property-option-empty';
              } else if (optionType === 'comparison') {
                dataTestId = optionValue ? `comparison-option-${optionValue}` : 'comparison-option-empty';
              }
              
              return (
                <option 
                  key={optionValue} 
                  value={optionValue}
                  data-testid={dataTestId}
                >
                  {optionLabel}
                </option>
              );
            })}
          </select>
        );
      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              id={name}
              name={name}
              type="checkbox"
              checked={value || false}
              onChange={onChange}
              className={`h-4 w-4 text-primary focus:ring-primary ${error ? 'border-red-500' : 'border-gray-300'} rounded`}
            />
            <label htmlFor={name} className="ml-2 text-sm font-medium text-gray-700">
              {label}
            </label>
          </div>
        );
      case 'radio':
        return (
          <div className="flex items-center">
            <input
              id={name}
              name={name}
              type="radio"
              checked={value || false}
              onChange={onChange}
              className={`h-4 w-4 text-primary focus:ring-primary ${error ? 'border-red-500' : 'border-gray-300'}`}
            />
            <label htmlFor={name} className="ml-2 text-sm font-medium text-gray-700">
              {label}
            </label>
          </div>
        );
      case 'custom':
        return children;
      default:
        return null;
    }
  };

  if (type === 'checkbox' || type === 'radio') {
    return (
      <div className={`mb-4 ${className}`}>
        {renderField()}
        {helpText && <p className="text-gray-500 text-xs mt-1">{helpText}</p>}
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  }

  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderField()}
      {helpText && <p className="text-gray-500 text-xs mt-1">{helpText}</p>}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default FormField;
