// In-memory request/response log storage
// In a production app, you'd want to use a database or persistent storage
let requestLog = [];

// Add a request/response entry to the log
function logRequest(entry) {
  const logEntry = {
    id: Date.now() + Math.random(), // Simple ID generation
    timestamp: new Date().toISOString(),
    ...entry
  };
  
  requestLog.unshift(logEntry); // Add to beginning of array (newest first)
  
  // Keep only the last 100 entries to prevent memory issues
  if (requestLog.length > 100) {
    requestLog = requestLog.slice(0, 100);
  }
  
  return logEntry;
}

// Get all log entries
function getLogEntries(limit = 50) {
  return requestLog.slice(0, limit);
}

// Clear the log
function clearLog() {
  requestLog = [];
  return true;
}

// Get log statistics
function getLogStats() {
  const total = requestLog.length;
  const successful = requestLog.filter(entry => entry.success).length;
  const failed = total - successful;
  
  const services = [...new Set(requestLog.map(entry => entry.service))];
  const credentialTypes = [...new Set(requestLog.map(entry => entry.credentialType))];
  
  return {
    total,
    successful,
    failed,
    services,
    credentialTypes
  };
}

// Filter log entries
function filterLogEntries(filters = {}) {
  let filtered = requestLog;
  
  if (filters.service) {
    filtered = filtered.filter(entry => entry.service === filters.service);
  }
  
  if (filters.success !== undefined) {
    filtered = filtered.filter(entry => entry.success === filters.success);
  }
  
  if (filters.credentialType) {
    filtered = filtered.filter(entry => entry.credentialType === filters.credentialType);
  }
  
  if (filters.dateFrom) {
    const fromDate = new Date(filters.dateFrom);
    filtered = filtered.filter(entry => new Date(entry.timestamp) >= fromDate);
  }
  
  if (filters.dateTo) {
    const toDate = new Date(filters.dateTo);
    filtered = filtered.filter(entry => new Date(entry.timestamp) <= toDate);
  }
  
  return filtered;
}

module.exports = {
  logRequest,
  getLogEntries,
  clearLog,
  getLogStats,
  filterLogEntries
};
