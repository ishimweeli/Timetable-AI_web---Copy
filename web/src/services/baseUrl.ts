// Fix to prevent double '/api/v1' in URLs
const BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Make sure BASE_URL doesn't end with a slash and our API path starts with one
export const API_URL = BASE_URL.endsWith('/') 
  ? `${BASE_URL}api/v1` 
  : `${BASE_URL}/api/v1`; 