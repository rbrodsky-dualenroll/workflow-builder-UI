/**
 * Helper function to convert a JavaScript object to a Ruby hash string representation
 * @param {Object} obj - The object to convert
 * @returns {string} - Ruby hash string representation
 */
const serializeToRubyHash = (obj) => {
  if (!obj || Object.keys(obj).length === 0) {
    return "{}";
  }
  
  const serializeValue = (value) => {
    if (value === null || value === undefined) {
      return 'nil';
    } else if (typeof value === 'string') {
      return `'${value}'`;
    } else if (Array.isArray(value)) {
      return `[${value.map(v => serializeValue(v)).join(', ')}]`;
    } else if (typeof value === 'object') {
      const entries = Object.entries(value).map(([k, v]) => {
        return `'${k}' => ${serializeValue(v)}`;
      }).join(', ');
      return `{${entries}}`;
    } else {
      return value.toString();
    }
  };
  
  const entries = Object.entries(obj).map(([key, value]) => {
    return `'${key}' => ${serializeValue(value)}`;
  }).join(', ');
  
  return `{ ${entries} }`;
};

/**
 * Convert a string to snake_case
 * @param {string} str - The string to convert
 * @returns {string} - snake_case string
 */
const snakeCase = (str) => {
  if (!str) return '';
  
  return str
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_+/g, '_');
};

/**
 * Map workflow category to ActiveFlowDefinition category
 * @param {string} workflowCategory - The workflow category from the step
 * @returns {string} - The corresponding ActiveFlowDefinition category
 */
const getWorkflowCategoryKey = (workflowCategory) => {
  if (!workflowCategory) return 'registration'; // Default to registration
  
  switch (workflowCategory.toLowerCase()) {
    case 'one time':
      return 'registration_one_time';
    case 'academic year':
      return 'registration_academic_year';
    case 'per term':
      return 'registration';  // Per Term steps go in the main StudentTerm flow
    case 'per course':
      return 'registration';  // Per Course steps go in the main registration flow
    default:
      return 'registration';
  }
};

export { serializeToRubyHash, snakeCase, getWorkflowCategoryKey };
