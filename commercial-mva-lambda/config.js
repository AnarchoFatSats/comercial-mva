/**
 * Configuration file for Commercial MVA Lead Management System
 * 
 * This file contains environment-specific configuration variables
 * that can be easily changed during deployment without modifying application code.
 */

// API endpoint configurations for different environments
const ENVIRONMENTS = {
  development: 'https://dev-api-gateway-url.execute-api.us-east-1.amazonaws.com/dev/commercial-mva-lead-processor',
  staging: 'https://stage-api-gateway-url.execute-api.us-east-1.amazonaws.com/stage/commercial-mva-lead-processor',
  production: 'https://bnmcip8xp5.execute-api.us-east-1.amazonaws.com/default/commercial-mva-lead-processor'
};

// Determine the current environment (default to production)
// This could be set via build process or by checking the URL
const currentEnvironment = (() => {
  const hostname = window.location.hostname;
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return 'development';
  } else if (hostname.includes('staging') || hostname.includes('test')) {
    return 'staging';
  }
  return 'production';
})();

// Export the API endpoint for the current environment
export const API_ENDPOINT = ENVIRONMENTS[currentEnvironment];

// Export other config variables as needed
export const VERSION = '1.0.0';
export const DEBUG_MODE = currentEnvironment !== 'production'; 