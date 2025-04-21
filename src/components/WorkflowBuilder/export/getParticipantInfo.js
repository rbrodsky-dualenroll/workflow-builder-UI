/**
 * Get the participant role for a step
 * @param {Object} step - Step data from the workflow
 * @returns {string} - Participant role
 */
const getParticipantRole = (step) => {
  if (step.role) {
    switch (step.role.toLowerCase()) {
      case 'college':
        return 'coll';
      case 'high school':
        return 'hs';
      case 'student':
        return 'student';
      case 'parent':
        return 'parent';
      case 'approver':
        return 'approver';
      case 'processing':
      case 'system':
        return 'system';
      default:
        return step.role.toLowerCase();
    }
  }
  
  return 'system';
};

/**
 * Get the participant name for a step
 * @param {Object} step - Step data from the workflow
 * @returns {string} - Participant name
 */
const getParticipant = (step) => {
  if (step.role) {
    switch (step.role.toLowerCase()) {
      case 'college':
        return 'College';
      case 'high school':
        return 'High School';
      case 'student':
        return 'Student';
      case 'parent':
        return 'Parent';
      case 'approver':
        return 'Approver';
      case 'processing':
      case 'system':
        if (step.participant){
          return step.participant;
        }
        return 'Processing';
      default:
        return step.role;
    }
  }
  
  return 'Processing';
};

export { getParticipantRole, getParticipant };
