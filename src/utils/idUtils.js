/**
 * Utility function for generating unique IDs
 * @param {string} prefix - Optional prefix for the ID
 * @returns {string} A unique ID with timestamp and random suffix
 */
export const generateUniqueId = (prefix = '') => {
  return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
