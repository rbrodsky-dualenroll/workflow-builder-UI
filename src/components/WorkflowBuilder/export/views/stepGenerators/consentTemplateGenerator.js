/**
 * Consent Step Template Generator
 * 
 * Functions for generating templates for consent steps
 */

/**
 * Generate template content for consent steps
 * This is a hardcoded standard view that's consistent across all implementations
 * @returns {string} - The template content
 */
export const generateConsentTemplate = () => {
  // Standard parent consent step template - always the same
  return `<%= render partial: 'shared/common_consent' %>
<br />
<p><%= lt :parent_consent_help %></p>
<%= render partial: 'shared/pci_logo' %>`;
};

/**
 * Generate parent consent instructions template
 * This is a hardcoded standard view that's consistent across all implementations
 * @returns {string} - The template content
 */
export const generateParentConsentInstructionsTemplate = () => {
  // Standard parent consent instructions template - always the same
  return `<%= render 'shared/local_text_translation_control' %>
<br />
<p><%= lt :parent_consent_intro %></p>
<br />
<p><%= @target.student.display_name %></p>
<br />
<p><%= lt :parent_consent_instructions_body %></p>`;
};

export default {
  generateConsentTemplate,
  generateParentConsentInstructionsTemplate
};
