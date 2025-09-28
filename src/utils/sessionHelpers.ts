/**
 * Validates if a session access code has the correct format
 * @param code - The access code to validate
 * @returns boolean indicating if the code is valid
 */
export const isValidAccessCode = (code: string): boolean => {
  if (!code || typeof code !== 'string') return false;
  
  // Remove whitespace and convert to uppercase
  const cleanCode = code.trim().toUpperCase();
  
  // Check if it's exactly 6 characters and contains only alphanumeric characters
  const codeRegex = /^[A-Z0-9]{6}$/;
  return codeRegex.test(cleanCode);
};

/**
 * Formats an access code to the standard format (uppercase, 6 characters)
 * @param code - The code to format
 * @returns formatted code
 */
export const formatAccessCode = (code: string): string => {
  if (!code) return '';
  
  // Remove any non-alphanumeric characters and convert to uppercase
  const cleaned = code.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  
  // Limit to 6 characters
  return cleaned.slice(0, 6);
};

/**
 * Generates a random access code for testing purposes
 * @returns A random 6-character access code
 */
export const generateTestAccessCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Creates a shareable session link
 * @param accessCode - The session access code
 * @param baseUrl - The base URL of the application
 * @returns Complete shareable URL
 */
export const createShareableLink = (accessCode: string, baseUrl?: string): string => {
  const base = baseUrl || window.location.origin;
  return `${base}/session/join/${accessCode}`;
};

/**
 * Extracts access code from a shareable link
 * @param link - The shareable link
 * @returns The access code or null if not found
 */
export const extractAccessCodeFromLink = (link: string): string | null => {
  try {
    const url = new URL(link);
    const pathParts = url.pathname.split('/');
    const joinIndex = pathParts.indexOf('join');
    
    if (joinIndex !== -1 && pathParts[joinIndex + 1]) {
      const code = pathParts[joinIndex + 1];
      return isValidAccessCode(code) ? code.toUpperCase() : null;
    }
    
    return null;
  } catch {
    return null;
  }
};
