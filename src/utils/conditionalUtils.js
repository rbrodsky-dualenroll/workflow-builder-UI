/**
 * Utilities for handling conditional logic in workflow steps
 * Updated to support precise entity/property mappings for Ruby output
 */

/**
 * Represents a condition as a human-readable string
 * 
 * @param {Object} condition - A condition object
 * @returns {string} - Human-readable representation
 */
export const formatConditionForDisplay = (condition) => {
  if (!condition) return '';
  
  // For new-style conditions with entity and property
  if (condition.entity && condition.property) {
    return formatStructuredCondition(condition);
  }
  
  // For legacy conditions with just a method
  if (condition.method) {
    return formatLegacyCondition(condition);
  }
  
  return '';
};

/**
 * Format a structured condition with entity and property
 * @param {Object} condition - A structured condition
 * @returns {string} - Human-readable representation
 */
const formatStructuredCondition = (condition) => {
  const { entity, property, comparison, value, fields } = condition;
  
  // Human-readable entities
  const entityLabels = {
    'Student': 'Student',
    'Course': 'Course',
    'CourseSection': 'Course Section',
    'HighSchool': 'High School',
    'Instructor': 'Instructor',
    'Term': 'Term',
    'College': 'College'
  };
  
  // Build the description
  let result = '';
  
  // Add entity
  const entityLabel = entityLabels[entity] || entity;
  result += entityLabel;
  
  // Add property
  // Try to make property more readable by converting camelCase to spaces
  const readableProperty = property
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .replace(/_/g, ' ');
  
  result += `'s ${readableProperty}`;
  
  // Add comparison
  switch (comparison) {
    case 'equals':
      result += ` equals "${value}"`;
      break;
    case 'not-equals':
      result += ` does not equal "${value}"`;
      break;
    case 'greater-than':
    case '>':
      result += ` is greater than ${value}`;
      break;
    case 'less-than':
    case '<':
      result += ` is less than ${value}`;
      break;
    case 'greater-than-or-equal':
    case '>=':
      result += ` is at least ${value}`;
      break;
    case 'less-than-or-equal':
    case '<=':
      result += ` is at most ${value}`;
      break;
    case 'contains':
    case 'includes':
      result += ` includes "${value}"`;
      break;
    case 'not-contains':
      result += ` does not include "${value}"`;
      break;
    case 'present':
      result += ` is present`;
      break;
    case 'blank':
      result += ` is blank`;
      break;
    case 'custom':
      return value; // For custom conditions
    default:
      result += ` ${comparison} ${value}`;
  }
  
  // Add fields that will be set
  if (fields && fields.length > 0) {
    result += ` → set ${fields.join(', ')}`;
  }
  
  return result;
};

/**
 * Format a legacy condition with just a method
 * @param {Object} condition - A legacy condition
 * @returns {string} - Human-readable representation
 */
const formatLegacyCondition = (condition) => {
  const { method, comparison, value, fields } = condition;
  
  // Try to make it more human-readable
  let result = '';
  
  // Parse entity and property from method
  let entity = '';
  let property = '';
  
  if (method.includes('_')) {
    const parts = method.split('_');
    entity = parts[0];
    property = parts.slice(1).join('_');
  } else {
    property = method;
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
    result = method.replace(/_/g, ' ');
  }
  
  // Add comparison
  switch (comparison) {
    case '==':
    case 'equals':
      result += ` equals "${value}"`;
      break;
    case '!=':
    case 'not-equals':
      result += ` does not equal "${value}"`;
      break;
    case '>':
    case 'greater-than':
      result += ` is greater than ${value}`;
      break;
    case '<':
    case 'less-than':
      result += ` is less than ${value}`;
      break;
    case '>=':
    case 'greater-than-or-equal':
      result += ` is at least ${value}`;
      break;
    case '<=':
    case 'less-than-or-equal':
      result += ` is at most ${value}`;
      break;
    case 'includes':
    case 'contains':
      result += ` includes "${value}"`;
      break;
    case 'present':
      result += ` is present`;
      break;
    case 'blank':
      result += ` is blank`;
      break;
    case 'custom':
      return value; // For custom conditions
    default:
      result += ` ${comparison} ${value}`;
  }
  
  // Add fields that will be set
  if (fields && fields.length > 0) {
    result += ` → set ${fields.join(', ')}`;
  }
  
  return result;
};

/**
 * Convert a condition to its Ruby code representation
 * @param {Object} condition - A condition object
 * @returns {string} - Ruby code for the condition
 */
export const generateRubyCode = (condition) => {
  if (!condition) return null;
  
  // If the condition has a predefined Ruby method, use it
  if (condition.rubyMethod) {
    // For boolean methods ending with ?
    if (condition.rubyMethod.endsWith('?')) {
      if ((condition.comparison === 'not-equals' || condition.comparison === '!=') ||
          (condition.value === 'false' || condition.value === false)) {
        return `!${getEntityVariable(condition.entity)}.${condition.rubyMethod}`;
      }
      return `${getEntityVariable(condition.entity)}.${condition.rubyMethod}`;
    }
    
    // For other methods, build the comparison
    const comparisonOp = getRubyComparisonOperator(condition.comparison);
    if (comparisonOp === 'present?') {
      return `${getEntityVariable(condition.entity)}.${condition.rubyMethod}.present?`;
    } else if (comparisonOp === 'blank?') {
      return `${getEntityVariable(condition.entity)}.${condition.rubyMethod}.blank?`;
    } else if (comparisonOp.includes('include?')) {
      const includeMethod = comparisonOp.startsWith('!') ? 
        `!${getEntityVariable(condition.entity)}.${condition.rubyMethod}.to_s.include?('${condition.value}')` :
        `${getEntityVariable(condition.entity)}.${condition.rubyMethod}.to_s.include?('${condition.value}')`;
      return includeMethod;
    } else {
      // Check if value is numeric
      const numValue = Number(condition.value);
      const isNumeric = !isNaN(numValue) && numValue.toString() === String(condition.value);
      const valueStr = isNumeric ? condition.value : `'${condition.value}'`;
      
      return `${getEntityVariable(condition.entity)}.${condition.rubyMethod} ${comparisonOp} ${valueStr}`;
    }
  }
  
  // For legacy conditions, try to build from entity/property
  if (condition.entity && condition.property) {
    let entityVar = getEntityVariable(condition.entity);
    let methodName = condition.property;
    
    // Handle boolean methods
    if (['is_home_school', 'is_non_partner', 'has_requisites', 'is_full', 'is_wish_list', 'is_minor'].includes(methodName)) {
      methodName = `${methodName}?`;
      
      if ((condition.comparison === 'not-equals' || condition.comparison === '!=') ||
          (condition.value === 'false' || condition.value === false)) {
        return `!${entityVar}.${methodName}`;
      }
      return `${entityVar}.${methodName}`;
    }
    
    // Special case for is_non_partner which needs a parameter
    if (methodName === 'is_non_partner?') {
      return `${entityVar}.${methodName.replace('?', '')}?(college)`;
    }
    
    // For other methods, build the comparison
    const comparisonOp = getRubyComparisonOperator(condition.comparison);
    
    // Check if value is numeric
    const numValue = Number(condition.value);
    const isNumeric = !isNaN(numValue) && numValue.toString() === String(condition.value);
    const valueStr = isNumeric ? condition.value : `'${condition.value}'`;
    
    return `${entityVar}.${methodName} ${comparisonOp} ${valueStr}`;
  }
  
  // For legacy method-only conditions
  if (condition.method) {
    // Try to parse entity_property format
    if (condition.method.includes('_')) {
      const parts = condition.method.split('_');
      const entity = parts[0];
      const property = parts.slice(1).join('_');
      
      const entityVar = getEntityVariable(entity);
      
      // If we have a recognized entity, build the proper Ruby
      if (entityVar) {
        if (property.endsWith('?') || ['is_home_school', 'is_non_partner', 'has_requisites'].includes(property)) {
          const methodName = property.endsWith('?') ? property : `${property}?`;
          
          if ((condition.comparison === 'not-equals' || condition.comparison === '!=') ||
              (condition.value === 'false' || condition.value === false)) {
            return `!${entityVar}.${methodName}`;
          }
          return `${entityVar}.${methodName}`;
        }
        
        // For other methods, build the comparison
        const comparisonOp = getRubyComparisonOperator(condition.comparison);
        
        // Check if value is numeric
        const numValue = Number(condition.value);
        const isNumeric = !isNaN(numValue) && numValue.toString() === String(condition.value);
        const valueStr = isNumeric ? condition.value : `'${condition.value}'`;
        
        return `${entityVar}.${property} ${comparisonOp} ${valueStr}`;
      }
    }
  }
  
  return null;
};

/**
 * Get the Ruby variable name for a given entity
 * @param {string} entity - The entity name
 * @returns {string} - The Ruby variable name
 */
function getEntityVariable(entity) {
  if (!entity) return null;
  
  const ENTITY_VARIABLES = {
    'Student': 'student',
    'student': 'student',
    'HighSchool': 'student.high_school',
    'high_school': 'student.high_school',
    'Course': 'course',
    'course': 'course',
    'CourseSection': 'course_section',
    'course_section': 'course_section',
    'Instructor': 'instructor',
    'instructor': 'instructor',
    'Term': 'term',
    'term': 'term',
    'College': 'college',
    'college': 'college'
  };
  
  return ENTITY_VARIABLES[entity] || entity.toLowerCase();
}

/**
 * Get the Ruby comparison operator for a given comparison type
 * @param {string} comparison - The comparison type
 * @returns {string} - The Ruby comparison operator
 */
function getRubyComparisonOperator(comparison) {
  const COMPARISON_OPERATORS = {
    'equals': '==', 
    '==': '==',
    'not-equals': '!=',
    '!=': '!=',
    'greater-than': '>',
    '>': '>',
    'less-than': '<',
    '<': '<',
    'greater-than-or-equal': '>=',
    '>=': '>=',
    'less-than-or-equal': '<=',
    '<=': '<=',
    'contains': 'include?',
    'includes': 'include?',
    'not-contains': '!include?',
    'present': 'present?',
    'blank': 'blank?'
  };
  
  return COMPARISON_OPERATORS[comparison] || '==';
}
