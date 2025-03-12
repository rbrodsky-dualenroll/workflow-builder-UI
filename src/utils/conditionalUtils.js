/**
 * Utilities for handling conditional logic in workflow steps
 */

/**
 * Parses a stringified JSON conditions array or a legacy condition string
 * 
 * @param {string} conditionValue - The value from the form (either JSON string or legacy condition string)
 * @returns {Array} - Array of condition objects
 */
export const parseConditionals = (conditionValue) => {
  if (!conditionValue) return [];
  
  try {
    // First try to parse as JSON
    return JSON.parse(conditionValue);
  } catch (e) {
    // If not valid JSON, treat as legacy condition string
    // Convert to a single condition object
    if (conditionValue.trim()) {
      return [
        {
          // We don't have method/fields for legacy conditions, so we'll use a placeholder
          method: 'legacy_condition',
          comparison: 'custom',
          value: conditionValue,
          fields: ['_legacy_condition_true'],
        }
      ];
    }
    
    return [];
  }
};

/**
 * Stringifies an array of condition objects to JSON
 * 
 * @param {Array} conditions - Array of condition objects
 * @returns {string} - JSON string representing the conditions
 */
export const stringifyConditionals = (conditions) => {
  if (!conditions || conditions.length === 0) return '';
  
  // Check if this is a legacy condition (simple string)
  if (conditions.length === 1 && 
      conditions[0].method === 'legacy_condition' && 
      conditions[0].comparison === 'custom') {
    return conditions[0].value;
  }
  
  return JSON.stringify(conditions);
};

/**
 * Validates that conditionals are properly structured
 * 
 * @param {Array} conditions - Array of condition objects
 * @returns {boolean} - True if valid, false otherwise
 */
export const validateConditionals = (conditions) => {
  if (!conditions || !Array.isArray(conditions)) return false;
  
  // Empty array is valid
  if (conditions.length === 0) return true;
  
  // Check each condition
  return conditions.every(condition => {
    // Method is required
    if (!condition.method) return false;
    
    // Comparison is required
    if (!condition.comparison) return false;
    
    // Value is required for most comparison types
    if (!['present', 'blank', 'true', 'false'].includes(condition.comparison) && 
        (condition.value === undefined || condition.value === null || condition.value === '')) {
      return false;
    }
    
    // Fields array is required
    if (!Array.isArray(condition.fields) || condition.fields.length === 0) {
      return false;
    }
    
    return true;
  });
};

/**
 * Represents a condition as a human-readable string
 * 
 * @param {Object} condition - A condition object
 * @returns {string} - Human-readable representation
 */
export const formatConditionForDisplay = (condition) => {
  if (!condition || !condition.method) return '';
  
  // Try to make it more human-readable
  let result = '';
  
  // Parse entity and property from method
  let entity = '';
  let property = '';
  
  if (condition.method.includes('_')) {
    const parts = condition.method.split('_');
    entity = parts[0];
    property = parts.slice(1).join('_');
  } else {
    property = condition.method;
  }
  
  // Human-readable entities
  const entityLabels = {
    student: 'Student',
    course: 'Course', 
    section: 'Course Section',
    instructor: 'Instructor',
    high_school: 'High School',
    term: 'Term',
    registration: 'Registration'
  };
  
  // Human-readable properties by entity
  const propertyLabels = {
    student: {
      age: 'Age',
      gpa: 'GPA',
      grade_level: 'Grade Level',
      has_financial_aid: 'Has Financial Aid',
      is_first_time: 'First-Time Student',
      has_parent_consent: 'Has Parent Consent'
    },
    course: {
      credits: 'Credits',
      category: 'Category',
      discipline: 'Discipline',
      has_prerequisites: 'Has Prerequisites'
    },
    section: {
      location: 'Location',
      format: 'Format',
      instructor_type: 'Instructor Type',
      capacity: 'Capacity',
      enrollment_count: 'Enrollment Count'
    },
    instructor: {
      is_high_school: 'Is High School Instructor',
      is_college: 'Is College Instructor',
      credentials: 'Credentials',
      discipline: 'Discipline'
    },
    high_school: {
      has_feeder_schools: 'Has Feeder Schools',
      payment_policy: 'Payment Policy',
      is_home_school: 'Is Home School'
    },
    term: {
      past_withdraw_deadline: 'Past Withdraw Deadline',
      past_drop_deadline: 'Past Drop Deadline',
      is_current: 'Is Current Term'
    },
    registration: {
      past_due: 'Has Past Due Payment',
      has_refund: 'Has Refund',
      approval_status: 'Approval Status'
    }
  };
  
  // Build the description
  if (entity && entityLabels[entity]) {
    result += entityLabels[entity];
    
    if (property && propertyLabels[entity] && propertyLabels[entity][property]) {
      result += `'s ${propertyLabels[entity][property]}`;
    } else if (property) {
      // Try to make property more readable by replacing underscores with spaces
      result += `'s ${property.replace(/_/g, ' ')}`;
    }
  } else {
    // For legacy or non-standard methods
    result = condition.method.replace(/_/g, ' ');
  }
  
  // Add comparison
  switch (condition.comparison) {
    case '==':
      result += ` equals "${condition.value}"`;
      break;
    case '!=':
      result += ` does not equal "${condition.value}"`;
      break;
    case '>':
      result += ` is greater than ${condition.value}`;
      break;
    case '<':
      result += ` is less than ${condition.value}`;
      break;
    case '>=':
      result += ` is at least ${condition.value}`;
      break;
    case '<=':
      result += ` is at most ${condition.value}`;
      break;
    case 'includes':
      result += ` includes "${condition.value}"`;
      break;
    case 'present':
      result += ` is present`;
      break;
    case 'blank':
      result += ` is blank`;
      break;
    case 'true':
      result += ` is true`;
      break;
    case 'false':
      result += ` is false`;
      break;
    case 'custom':
      return condition.value; // For legacy conditions
    default:
      result += ` ${condition.comparison} ${condition.value}`;
  }
  
  // Add fields that will be set
  if (condition.fields && condition.fields.length > 0) {
    result += ` → set ${condition.fields.join(', ')}`;
  }
  
  return result;
};

/**
 * Represents a list of conditions as a human-readable string
 * 
 * @param {Array} conditions - Array of condition objects
 * @returns {string} - Human-readable representation
 */
export const formatConditionalsForDisplay = (conditions) => {
  if (!conditions || conditions.length === 0) return '';
  
  return conditions.map(cond => formatConditionForDisplay(cond)).join('\n');
};
