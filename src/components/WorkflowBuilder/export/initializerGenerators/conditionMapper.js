/**
 * Condition Mapper
 * 
 * Maps workflow conditions to precise Ruby code using well-defined mappings
 * based on actual DualEnroll application methods
 */

import { snakeCase } from '../utils';

/**
 * Transform a condition into Ruby code
 * @param {Object} condition - The condition object to transform
 * @returns {string} - A string with the Ruby condition
 */
export const transformConditionToRuby = (condition) => {
  if (!condition) return null;
  
  console.log('Processing condition:', condition);
  
  // If the condition already has a predefined rubyMethod, use it directly
  if (condition.rubyMethod) {
    // Special case for properties ending with ?
    if (condition.rubyMethod.endsWith('?')) {
      const entityVar = getEntityVariable(condition.entity);
      
      // Handle negation based on comparison and value
      if ((condition.comparison === 'not-equals' || condition.comparison === '!=') ||
          (condition.value === 'false' || condition.value === false)) {
        return `!${entityVar}.${condition.rubyMethod}`;
      }
      
      // For is_non_partner, we need to add the college parameter
      if (condition.rubyMethod === 'is_non_partner?') {
        return `${entityVar}.${condition.rubyMethod.replace('?', '')}?(college)`;
      }
      
      return `${entityVar}.${condition.rubyMethod}`;
    }
  }
  
  // Handle predefined condition mappings by name
  if (condition.name) {
    const directMapping = CONDITION_NAME_MAPPINGS[condition.name];
    if (directMapping) {
      console.log(`Found direct mapping for condition name "${condition.name}"`);
      return directMapping;
    }
  }
  
  // If the entity is HighSchool and property is is_home_school, return the proper Ruby code
  if (condition.entity === 'HighSchool' && condition.property === 'is_home_school') {
    return 'student.high_school.is_home_school?';
  }
  
  // For other cases, use the more precise entity/property approach
  const entityVar = getEntityVariable(condition.entity);
  if (!entityVar) {
    console.warn(`Unknown entity: ${condition.entity}`);
    return null;
  }
  
  // Get the property method name
  const methodName = getPropertyMethod(condition.entity, condition.property);
  if (!methodName) {
    console.warn(`Unknown property ${condition.property} for entity ${condition.entity}`);
    return null;
  }
  
  // Build the appropriate Ruby condition based on the comparison and value
  return buildRubyCondition(entityVar, methodName, condition.comparison, condition.value);
};

/**
 * Get the standard Ruby variable name for a given entity
 * @param {string} entity - The entity name from the UI
 * @returns {string|null} - The standard Ruby variable name
 */
function getEntityVariable(entity) {
  if (!entity) return null;
  
  // Map UI entity names to actual Ruby variable names
  const ENTITY_VARIABLES = {
    'Student': 'student',
    'student': 'student',
    'HighSchool': 'student.high_school',
    'high_school': 'student.high_school',
    'Course': 'course',
    'course': 'course',
    'CourseSection': 'course_section',
    'course_section': 'course_section',
    'Term': 'term',
    'term': 'term',
    'Instructor': 'instructor',
    'instructor': 'instructor',
    'College': 'college',
    'college': 'college'
  };
  
  return ENTITY_VARIABLES[entity] || entity.toLowerCase();
}

/**
 * Get the standard Ruby method name for a given entity property
 * @param {string} entity - The entity name
 * @param {string} property - The property name from the UI
 * @returns {string|null} - The standard Ruby method name
 */
function getPropertyMethod(entity, property) {
  if (!entity || !property) return null;
  
  const entityLower = entity.toLowerCase();
  const propertyLower = property.toLowerCase();
  
  // Map entity properties to their exact Ruby method names
  const PROPERTY_METHODS = {
    'student': {
      'isMinor': 'is_minor?',
      'is_minor': 'is_minor?',
      'hasParentConsent': 'has_parent_consent?',
      'has_parent_consent': 'has_parent_consent?',
      'isHomeSchool': 'high_school.is_home_school?',
      'is_home_school': 'high_school.is_home_school?',
      'name': 'name',
      'grade': 'grade',
      'email': 'email',
      'age': 'age'
    },
    'high_school': {
      'isNonPartner': 'is_non_partner?(college)',
      'is_non_partner': 'is_non_partner?(college)',
      'isHomeSchool': 'is_home_school?',
      'is_home_school': 'is_home_school?',
      'name': 'name',
      'type': 'type'
    },
    'course': {
      'hasPrerequisites': 'has_requisites?',
      'has_prerequisites': 'has_requisites?',
      'hasRequisites': 'has_requisites?',
      'has_requisites': 'has_requisites?',
      'hasCourseCategory': 'has_course_category?',
      'has_course_category': 'has_course_category?',
      'title': 'title',
      'number': 'number',
      'subject': 'subject'
    },
    'course_section': {
      'isFull': 'is_full?',
      'is_full': 'is_full?',
      'isWishList': 'is_wish_list?',
      'is_wish_list': 'is_wish_list?',
      'number': 'number',
      'capacity': 'capacity',
      'enrollment_count': 'enrollment_count',
      'location': 'location'
    },
    'term': {
      'name': 'name',
      'start_date': 'start_date',
      'end_date': 'end_date'
    }
  };
  
  if (PROPERTY_METHODS[entityLower] && PROPERTY_METHODS[entityLower][property]) {
    return PROPERTY_METHODS[entityLower][property];
  }
  
  // Special case for is_home_school property in high_school entity - common in workflows
  if (entityLower === 'high_school' && propertyLower === 'is_home_school') {
    return 'is_home_school?';
  }
  
  // If no direct mapping, convert to standard Ruby style method name
  return property;
}

/**
 * Build a Ruby condition based on the comparison type and value
 * @param {string} entityVar - The entity variable
 * @param {string} methodName - The method name
 * @param {string} comparison - The comparison operator
 * @param {any} value - The value to compare against
 * @returns {string} - A Ruby condition
 */
function buildRubyCondition(entityVar, methodName, comparison, value) {
  // Special case for boolean methods that end with ?
  if (methodName.endsWith('?')) {
    if (value === true || value === 'true' || comparison === 'present') {
      return `${entityVar}.${methodName}`;
    } else if (value === false || value === 'false' || comparison === 'blank') {
      return `!${entityVar}.${methodName}`;
    }
  }
  
  // Add parentheses for calls with arguments
  if (methodName.includes('?(')) {
    return `${entityVar}.${methodName}`;
  }
  
  // For other comparison types
  switch (comparison) {
    case 'equals':
    case '==':
      // For numeric values, don't use quotes
      if (typeof value === 'number' || (!isNaN(Number(value)) && value.toString() === String(value))) {
        return `${entityVar}.${methodName.replace('?', '')} == ${value}`;
      }
      return `${entityVar}.${methodName.replace('?', '')} == '${value}'`;
      
    case 'not-equals':
    case '!=':
      if (typeof value === 'number' || (!isNaN(Number(value)) && value.toString() === String(value))) {
        return `${entityVar}.${methodName.replace('?', '')} != ${value}`;
      }
      return `${entityVar}.${methodName.replace('?', '')} != '${value}'`;
      
    case 'greater-than':
    case '>':
      return `${entityVar}.${methodName.replace('?', '')} > ${value}`;
      
    case 'less-than':
    case '<':
      return `${entityVar}.${methodName.replace('?', '')} < ${value}`;
      
    case 'greater-than-or-equal':
    case '>=':
      return `${entityVar}.${methodName.replace('?', '')} >= ${value}`;
      
    case 'less-than-or-equal':
    case '<=':
      return `${entityVar}.${methodName.replace('?', '')} <= ${value}`;
      
    case 'includes':
    case 'contains':
      return `${entityVar}.${methodName.replace('?', '')}.to_s.include?('${value}')`;
      
    case 'not-includes':
    case 'not-contains':
      return `!${entityVar}.${methodName.replace('?', '')}.to_s.include?('${value}')`;
      
    case 'present':
      if (methodName.endsWith('?')) {
        return `${entityVar}.${methodName}`;
      }
      return `${entityVar}.${methodName.replace('?', '')}.present?`;
      
    case 'blank':
      if (methodName.endsWith('?')) {
        return `!${entityVar}.${methodName}`;
      }
      return `${entityVar}.${methodName.replace('?', '')}.blank?`;
      
    default:
      return `${entityVar}.${methodName.replace('?', '')} == '${value}'`;
  }
}

/**
 * Precise mappings from condition names to Ruby conditions
 * Based on actual DualEnroll application code
 */
const CONDITION_NAME_MAPPINGS = {
  // High School conditions
  'home_school': 'student.high_school.is_home_school?',
  'homeschool': 'student.high_school.is_home_school?',
  'home_schooled': 'student.high_school.is_home_school?',
  'is_home_school': 'student.high_school.is_home_school?',
  'isHomeSchool': 'student.high_school.is_home_school?',
  
  // Non-partner high school conditions
  'non_partner': 'student.high_school.is_non_partner?(college)',
  'nonpartner': 'student.high_school.is_non_partner?(college)',
  'is_non_partner': 'student.high_school.is_non_partner?(college)',
  'isNonPartner': 'student.high_school.is_non_partner?(college)',
  
  // Course prerequisites conditions
  'has_prereqs': 'course.has_requisites?',
  'hasPrerequisites': 'course.has_requisites?',
  'has_prerequisites': 'course.has_requisites?',
  'hasRequisites': 'course.has_requisites?',
  'has_requisites': 'course.has_requisites?',
  'prerequisites': 'course.has_requisites?',
  'requisites': 'course.has_requisites?',
  
  // Course is in wish list
  'wish_list': 'course_section.is_wish_list?',
  'isWishList': 'course_section.is_wish_list?',
  'is_wish_list': 'course_section.is_wish_list?',
  
  // Course section is full
  'section_full': 'course_section.is_full?',
  'isSectionFull': 'course_section.is_full?',
  'is_section_full': 'course_section.is_full?',
  'course_full': 'course_section.is_full?',
  
  // Student age/minor status
  'minor': 'student.is_minor?',
  'is_minor': 'student.is_minor?',
  'isMinor': 'student.is_minor?',
  
  // Parent consent status
  'has_parent_consent': 'student.has_parent_consent?',
  'hasParentConsent': 'student.has_parent_consent?',
  'parent_consent': 'student.has_parent_consent?',
  
  // Course location
  'on_campus': "course_section.location == 'College Campus'",
  'college_campus': "course_section.location == 'College Campus'",
  'at_high_school': "course_section.location == 'High School'"
};
