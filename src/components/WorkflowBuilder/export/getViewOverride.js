/**
 * Get the view override path for a step
 * @param {Object} step - Step data from the workflow
 * @returns {string} - View override path
 */
const getViewOverride = (step) => {
  console.log(`GETTING VIEW OVERRIDE FOR STEP: ${JSON.stringify(step)}`);
  
  // Return empty for system steps
  if (step.participant_role === 'system' || step.role === 'System' || 
      step.role === 'Processing' || step.stepType === 'system') {
    return '';
  }
  
  // If there's an explicit override, use it
  if (step.viewNameOverride) {
    return step.viewNameOverride;
  }
  
  // Handle feedback steps
  if (step.isFeedbackStep) {
    const role = step.role ? step.role.toLowerCase() : 'student';
    
    if (role === 'student') {
      return 'active_flow_steps/course_registration/student/provide_additional_info';
    } else if (role === 'high school' || role === 'counselor') {
      return 'active_flow_steps/course_registration/high_school/provide_additional_info';
    } else if (role === 'approver') {
      return 'active_flow_steps/course_registration/approver/provide_additional_info';
    } else if (role === 'parent') {
      return 'active_flow_steps/course_registration/parent/provide_additional_info';
    } else if (role === 'college') {
      return 'active_flow_steps/course_registration/college/provide_additional_info';
    }
    
    // Generic path for other roles
    return `active_flow_steps/course_registration/${role}/provide_additional_info`;
  }
  
  // Handle regular steps based on step type and role
  const role = step.role ? step.role.toLowerCase() : 'student';
  
  // Handle high school steps
  if (role === 'high school' || role === 'counselor') {
    if (step.stepType === 'Approval') {
      if (step.workflow_category === 'Per Course') {
        return 'active_flow_steps/course_registration/high_school/confirm_enrollment';
      } else if (step.title && step.title.toLowerCase().includes('resolve')) {
        return 'active_flow_steps/course_registration/high_school/registration_resolve_issues';
      }
    } else if (step.stepType === 'Upload') {
      if (step.title && (step.title.toLowerCase().includes('transcript') || 
                         step.title.toLowerCase().includes('test') || 
                         step.title.toLowerCase().includes('documentation'))) {
        return 'active_flow_steps/course_registration/high_school/provide_additional_info';
      } else if (step.title && step.title.toLowerCase().includes('resolve')) {
        return 'active_flow_steps/course_registration/high_school/registration_resolve_issues';
      }
    }
  }
  
  // Handle college steps
  else if (role === 'college') {
    if (step.stepType === 'Approval') {
      if (step.workflow_category === 'Per Course') {
        return 'active_flow_steps/course_registration/college/review_course';
      } else if (step.title && step.title.toLowerCase().includes('eligibility')) {
        return 'active_flow_steps/course_registration/college/review_student_registration_eligibility';
      } else if (step.title && step.title.toLowerCase().includes('petition')) {
        return 'active_flow_steps/course_registration/college/process_petitions';
      } else if (step.title && step.title.toLowerCase().includes('student record')) {
        return 'active_flow_steps/course_registration/college/review_student_record';
      } else if (step.title && step.title.toLowerCase().includes('decline')) {
        return 'active_flow_steps/course_registration/college/review_declined_registration';
      } else if (step.title && step.title.toLowerCase().includes('affidavit')) {
        return 'active_flow_steps/course_registration/college/review_home_school_affidavit';
      }
    }
  }
  
  // Handle student steps
  else if (role === 'student') {
    if (step.stepType === 'Approval') {
      if (step.title && step.title.toLowerCase().includes('section')) {
        return 'active_flow_steps/course_registration/student/select_course_section_full';
      } else if (step.title && step.title.toLowerCase().includes('hold')) {
        return 'active_flow_steps/course_registration/student/resolve_orientation_hold';
      }
    } else if (step.stepType === 'Upload') {
      if (step.title && step.title.toLowerCase().includes('resolve')) {
        return 'active_flow_steps/course_registration/student/registration_resolve_issues';
      } else {
        return 'active_flow_steps/course_registration/student/provide_additional_info';
      }
    }
  }
  
  // Handle parent steps
  else if (role === 'parent') {
    if (step.stepType === 'Approval' || step.stepType === 'ProvideConsent') {
      return 'active_flow_steps/course_registration/parent/provide_consent'; 
    } else if (step.stepType === 'Upload') {
      if (step.title && step.title.toLowerCase().includes('affidavit')) {
        return 'active_flow_steps/course_registration/approver/home_school_affidavit';
      } else {
        return 'active_flow_steps/course_registration/parent/provide_additional_info';
      }
    }
  }
  
  // Handle approver steps
  else if (role === 'approver') {
    if (step.stepType === 'Approval') {
      return 'active_flow_steps/course_registration/approver/confirm';
    } else if (step.stepType === 'Upload') {
      if (step.title && step.title.toLowerCase().includes('affidavit')) {
        return 'active_flow_steps/course_registration/approver/home_school_affidavit';
      } else {
        return 'active_flow_steps/course_registration/approver/provide_additional_info';
      }
    }
  }
  
  // Default action based on step type
  let action;
  switch (step.stepType && step.stepType.toLowerCase()) {
    case 'approval':
      action = 'approve';
      break;
    case 'upload':
      action = 'provide_additional_info';
      break;
    case 'information':
      action = 'info';
      break;
    default:
      action = 'approve';
  }
  
  // Convert role to proper format for path (snake_case)
  const formattedRole = role.replace(/\s+/g, '_').toLowerCase();
  
  // Use standard path format with role and action
  return `active_flow_steps/course_registration/${formattedRole}/${action}`;
};

export default getViewOverride;
