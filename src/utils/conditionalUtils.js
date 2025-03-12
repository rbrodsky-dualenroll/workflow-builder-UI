/**
 * Utilities for handling conditional logic in workflow steps
 */

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
