/**
 * Get the border color based on step type
 * @param {string} stepType The type of step
 * @returns {string} CSS class for the border color
 */
export const getStepTypeColor = (stepType) => {
  switch (stepType) {
    case 'Approval': return 'border-primary';
    case 'Upload': return 'border-secondary';
    case 'Information': return 'border-yellow-400';
    case 'ProvideConsent': return 'border-green-500';
    case 'CheckHolds': return 'border-orange-500';
    case 'RegisterViaApi': return 'border-purple-500';
    case 'ResolveIssue': return 'border-red-500';
    default: return 'border-gray-400';
  }
};

/**
 * Get workflow_category badge class based on workflow_category type
 * @param {string} workflow_category The workflow_category type
 * @returns {string} CSS class for the badge
 */
export const getWorkflowCategoryBadgeClass = (workflow_category) => {
  switch (workflow_category) {
    case 'One Time': return 'bg-purple-100 text-purple-800';
    case 'Per Academic Year': return 'bg-blue-100 text-blue-800';
    case 'Per Term': return 'bg-green-100 text-green-800';
    case 'Per Course': return 'bg-orange-100 text-orange-800';
    case 'Drop/Withdraw': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Sample data for placeholders in step previews
 */
export const placeholderData = {
  'Student Name': 'Shelby Hyatt',
  'Course Number': 'MATH 101',
  'Course Title': 'Introduction to Statistics',
  'CRN': '4857',
  'Section': 'A01',
  'Instructor': 'Dr. Johnson',
  'Term': 'Fall 2023',
  'Credits': '3',
  'Status': 'Pending',
  'High School': 'Lincoln High School',
  'Hold Names': 'Financial Hold, Orientation Required',
  'Messages': 'Must resolve holds before registration',
  'Fee Amount': '$350.00',
  'Payment Status': 'Unpaid',
  'Grade': 'N/A'
};

/**
 * Additional data for CRN display fields
 */
export const crnDisplayData = {
  'time': 'MWF 10:00-10:50 AM',
  'days': 'MWF',
  'location': 'Main Campus Room 103',
  'instructor': 'Dr. Johnson',
  'available_seats': '12 of 30',
  'campus': 'Main Campus',
  'delivery': 'In Person'
};

/**
 * Get label for CRN display field
 */
export const getCrnDisplayLabel = (field) => {
  const labels = {
    'time': 'Meeting Time',
    'days': 'Meeting Days',
    'location': 'Location',
    'instructor': 'Instructor',
    'available_seats': 'Available Seats',
    'campus': 'Campus',
    'delivery': 'Delivery Method'
  };
  return labels[field] || field;
};
