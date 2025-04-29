/**
 * Utilities for categorizing workflow steps
 */

/**
 * Categorize workflow steps by their appropriate workflow type
 * @param {Array} workflow - All steps in the workflow
 * @returns {Object} - Object with categorized steps
 */
export const categorizeWorkflowSteps = (workflow) => {
  const categorizedSteps = {
    college_student_application: [], // One Time workflow
    student_term_academic_year: [], // Academic Year workflow
    student_term: [],               // Per Term workflow
    registration: []                // Per Course (Registration) workflow
  };
  
  workflow.forEach(step => {
    if (!step.workflow_category) {
      // Default to per-course if not specified
      categorizedSteps.registration.push(step);
      return;
    }
    
    // Categorize based on workflow_category
    switch (step.workflow_category.toLowerCase()) {
      case 'one time':
        categorizedSteps.college_student_application.push(step);
        break;
      case 'per academic year':
        categorizedSteps.student_term_academic_year.push(step);
        break;
      case 'per term':
        categorizedSteps.student_term.push(step);
        break;
      case 'per course':
      case 'drop/withdraw':
      default:
        categorizedSteps.registration.push(step);
        break;
    }
  });
  
  return categorizedSteps;
};

/**
 * Generate version numbers for different workflow types
 * @returns {Object} - Version numbers for different workflow types
 */
export const generateVersionNumbers = () => {
  return {
    college_student_application: 1,
    student_term_academic_year: 1,
    student_term: 1,
    registration: 1
  };
};

export const identifyWorkflowCategories = (workflow) => {
  console.log('\n==== DEBUG: identifyWorkflowCategories ====');
  console.log('Input workflow steps:', workflow.length);
  workflow.forEach((step, i) => {
    console.log(`Step ${i+1}: "${step.title}" - workflow_category = "${step.workflow_category}"`);
  });
  
  // All possible workflow categories
  const allPossibleCategories = [
    {
      name: 'college_student_application',
      targetObject: 'CollegeStudentApplication',
      category: 'registration_one_time',
      displayName: 'One Time Per-Student Parent Consent'
    },
    {
      name: 'student_term_academic_year',
      targetObject: 'StudentTerm',
      category: 'registration_academic_year',
      displayName: 'Academic Year Per-Student'
    },
    {
      name: 'student_term',
      targetObject: 'StudentTerm',
      category: 'registration',
      displayName: 'Per-Term Per-Student'
    },
    {
      name: 'registration',
      targetObject: 'StudentDeCourse',
      category: 'registration',
      displayName: 'Registration'
    }
  ];
  
  // Identify which categories are used in the workflow
  const usedCategories = new Set();
  
  // Always include registration as a default
  usedCategories.add('registration');
  console.log('Added default "registration" category');
  
  // Check each workflow step to determine which categories are used
  workflow.forEach(step => {
    if (step.workflow_category) {
      console.log(`Processing step "${step.title}" with category "${step.workflow_category}"`);
      const category = step.workflow_category.toLowerCase();
      
      if (category === 'one time') {
        console.log('  -> Matched to "college_student_application"');
        usedCategories.add('college_student_application');
      } else if (category === 'per academic year') {
        console.log('  -> Matched to "student_term_academic_year"');
        usedCategories.add('student_term_academic_year');
      } else if (category === 'per term') {
        console.log('  -> Matched to "student_term"');
        usedCategories.add('student_term');
      } else if (category === 'per course' || category === 'drop/withdraw') {
        console.log('  -> Matched to "registration"');
        usedCategories.add('registration');
      } else {
        console.log(`  -> WARNING: Unknown category "${category}"`);
      }
    }
  });
  
  // Return only the categories that are actually used in the workflow
  const result = allPossibleCategories.filter(category => usedCategories.has(category.name));
  console.log('Identified workflow categories:', result.map(c => c.name));
  console.log('==== END DEBUG: identifyWorkflowCategories ====\n');
  return result;
};
