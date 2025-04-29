/**
 * Initializer Generator
 * 
 * This module generates a Ruby initializer class file based on the workflow conditions
 * to handle setting conditional fields and completion states appropriately.
 */

import { generateInitializerClass, getWorkflowCategoryForTargetObjectType } from './initializerGenerators';

// Export the main functions for use in other modules
export { generateInitializerClass, getWorkflowCategoryForTargetObjectType };

// Export the main function as default
export default generateInitializerClass;
