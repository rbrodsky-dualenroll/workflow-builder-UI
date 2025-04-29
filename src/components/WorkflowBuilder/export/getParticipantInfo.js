/**
 * Get the participant role for a step
 * @param {Object} step - Step data from the workflow
 * @returns {string} - Participant role
 */
const getParticipantRole = (step) => {
  if (step.role) {
    const roleLower = step.role.toLowerCase();
    switch (roleLower) {
      case 'college':
        return 'coll';
      case 'high school':
        return 'hs';
      case 'student':
        return 'student';
      case 'parent':
      case 'parent/guardian':  // Handle Parent/Guardian case properly
        return 'parent';
      case 'approver':
        return 'approver';
      case 'processing':
      case 'system':
        return 'system';
      default:
        // Ensure we don't return parent/guardian
        if (roleLower === 'parent/guardian') {
          return 'parent';
        }
        return roleLower;
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
    const roleLower = step.role.toLowerCase();
    switch (roleLower) {
      case 'college':
        return 'College';
      case 'high school':
        return 'High School';
      case 'student':
        return 'Student';
      case 'parent':
      case 'parent/guardian': // Handle Parent/Guardian case properly
        return 'Parent';
      case 'approver':
        return 'Approver';
      case 'processing':
      case 'system':
        if (step.participant){
          // If participant is Parent/Guardian, correct it
          if (step.participant === 'Parent/Guardian') {
            return 'Parent';
          }
          return step.participant;
        }
        return 'Processing';
      default:
        // Ensure we don't return Parent/Guardian
        if (roleLower === 'parent/guardian') {
          return 'Parent';
        }
        return step.role;
    }
  }
  
  return 'Processing';
};

export { getParticipantRole, getParticipant };
