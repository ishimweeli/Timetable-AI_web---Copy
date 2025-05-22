/**
 * Gets the current organization ID from localStorage
 * @returns {string | null} The selected organization ID
 */
export const getCurrentOrganizationId = (): string | null => {
  return localStorage.getItem("selectedOrganizationId");
};