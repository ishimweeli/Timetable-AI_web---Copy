/**
 * Request Throttler
 * 
 * A utility to prevent making too many API requests in quick succession.
 * This utility keeps track of the last time a request was made and
 * only allows a new request if a minimum time interval has passed.
 */

// Store the last request time for each unique request ID
const lastRequestTimes: Record<string, number> = {};

// Default minimum time between requests (in milliseconds)
const DEFAULT_THROTTLE_TIME = 2000; // 2 seconds

/**
 * Check if a request should be throttled
 * @param requestId Unique identifier for the request type
 * @param throttleTime Minimum time between requests in milliseconds
 * @returns boolean - true if the request should be allowed, false if it should be throttled
 */
export const shouldAllowRequest = (
  requestId: string, 
  throttleTime: number = DEFAULT_THROTTLE_TIME
): boolean => {
  const now = Date.now();
  const lastTime = lastRequestTimes[requestId] || 0;
  
  // Check if enough time has passed since the last request
  if (now - lastTime < throttleTime) {
    console.log(`Request throttled: ${requestId}`);
    return false;
  }
  
  // Update the last request time
  lastRequestTimes[requestId] = now;
  return true;
};

/**
 * Execute a function only if it's not being throttled
 * @param requestId Unique identifier for the request type
 * @param fn Function to execute if not throttled
 * @param throttleTime Minimum time between executions in milliseconds
 * @returns void
 */
export const executeIfNotThrottled = (
  requestId: string,
  fn: () => void,
  throttleTime: number = DEFAULT_THROTTLE_TIME
): void => {
  if (shouldAllowRequest(requestId, throttleTime)) {
    fn();
  }
};

export default {
  shouldAllowRequest,
  executeIfNotThrottled
}; 