import { LogEntry } from '../types';

// In-memory request/response log storage
// In a production app, you'd want to use a database or persistent storage
let requestLog: LogEntry[] = [];

// Log entry input interface
interface LogEntryInput {
  service: string;
  operation: string;
  request: {
    service: string;
    operation: string;
    payload: Record<string, unknown>;
    credentials: {
      type: string;
      name: string;
      region?: string;
    };
    region: string;
  };
  response: {
    success: boolean;
    data?: Record<string, unknown>;
    error?: string;
    statusCode?: number;
    requestId?: string;
  };
  duration: number;
  success?: boolean;
  credentialType?: string;
}

// Add a request/response entry to the log
export function logRequest(entry: LogEntryInput): LogEntry {
  const logEntry: LogEntry = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    service: entry.service,
    operation: entry.operation,
    request: {
      service: entry.request.service,
      operation: entry.request.operation,
      payload: entry.request.payload,
      credentials: {
        type: entry.request.credentials.type as 'environment' | 'profile' | 'ec2-instance',
        name: entry.request.credentials.name,
        region: entry.request.credentials.region
      },
      region: entry.request.region
    },
    response: entry.response,
    duration: entry.duration
  };
  
  requestLog.unshift(logEntry); // Add to beginning of array (newest first)
  
  // Keep only the last 100 entries to prevent memory issues
  if (requestLog.length > 100) {
    requestLog = requestLog.slice(0, 100);
  }
  
  return logEntry;
}

// Get all log entries
export function getLogEntries(limit: number = 50): LogEntry[] {
  return requestLog.slice(0, limit);
}

// Clear the log
export function clearLog(): boolean {
  requestLog = [];
  return true;
}

// Log statistics interface
interface LogStats {
  total: number;
  successful: number;
  failed: number;
  services: string[];
  credentialTypes: string[];
  averageDuration: number;
  recentActivity: LogEntry[];
}

// Get log statistics
export function getLogStats(): LogStats {
  const total = requestLog.length;
  const successful = requestLog.filter(entry => entry.response.success).length;
  const failed = total - successful;
  
  const services = [...new Set(requestLog.map(entry => entry.service))];
  const credentialTypes = [...new Set(requestLog.map(entry => entry.request.credentials.type))];
  
  const totalDuration = requestLog.reduce((sum, entry) => sum + entry.duration, 0);
  const averageDuration = total > 0 ? Math.round(totalDuration / total) : 0;
  
  const recentActivity = requestLog.slice(0, 10);
  
  return {
    total,
    successful,
    failed,
    services,
    credentialTypes,
    averageDuration,
    recentActivity
  };
}

// Filter options interface
interface FilterOptions {
  service?: string;
  success?: boolean;
  credentialType?: string;
  dateFrom?: string | Date;
  dateTo?: string | Date;
  operation?: string;
  limit?: number;
}

// Filter log entries
export function filterLogEntries(filters: FilterOptions = {}): LogEntry[] {
  let filtered = requestLog;
  
  if (filters.service) {
    filtered = filtered.filter(entry => entry.service === filters.service);
  }
  
  if (filters.operation) {
    filtered = filtered.filter(entry => entry.operation === filters.operation);
  }
  
  if (filters.success !== undefined) {
    filtered = filtered.filter(entry => entry.response.success === filters.success);
  }
  
  if (filters.credentialType) {
    filtered = filtered.filter(entry => entry.request.credentials.type === filters.credentialType);
  }
  
  if (filters.dateFrom) {
    const fromDate = new Date(filters.dateFrom);
    filtered = filtered.filter(entry => entry.timestamp >= fromDate);
  }
  
  if (filters.dateTo) {
    const toDate = new Date(filters.dateTo);
    filtered = filtered.filter(entry => entry.timestamp <= toDate);
  }
  
  const limit = filters.limit || filtered.length;
  return filtered.slice(0, limit);
}

// Get log entry by ID
export function getLogEntryById(id: string): LogEntry | undefined {
  return requestLog.find(entry => entry.id === id);
}

// Export log entries as JSON
export function exportLogEntries(filters?: FilterOptions): string {
  const entries = filters ? filterLogEntries(filters) : requestLog;
  return JSON.stringify(entries, null, 2);
}

// Get log entries for a specific time range
export function getLogEntriesInRange(startDate: Date, endDate: Date): LogEntry[] {
  return requestLog.filter(entry => 
    entry.timestamp >= startDate && entry.timestamp <= endDate
  );
}

// Get performance metrics
interface PerformanceMetrics {
  averageResponseTime: number;
  slowestOperation: { service: string; operation: string; duration: number } | null;
  fastestOperation: { service: string; operation: string; duration: number } | null;
  operationCounts: Record<string, number>;
  errorRate: number;
}

export function getPerformanceMetrics(): PerformanceMetrics {
  if (requestLog.length === 0) {
    return {
      averageResponseTime: 0,
      slowestOperation: null,
      fastestOperation: null,
      operationCounts: {},
      errorRate: 0
    };
  }
  
  const totalDuration = requestLog.reduce((sum, entry) => sum + entry.duration, 0);
  const averageResponseTime = Math.round(totalDuration / requestLog.length);
  
  const sortedByDuration = [...requestLog].sort((a, b) => b.duration - a.duration);
  const slowestOperation = sortedByDuration[0] ? {
    service: sortedByDuration[0].service,
    operation: sortedByDuration[0].operation,
    duration: sortedByDuration[0].duration
  } : null;
  
  const fastestOperation = sortedByDuration[sortedByDuration.length - 1] ? {
    service: sortedByDuration[sortedByDuration.length - 1].service,
    operation: sortedByDuration[sortedByDuration.length - 1].operation,
    duration: sortedByDuration[sortedByDuration.length - 1].duration
  } : null;
  
  const operationCounts: Record<string, number> = {};
  requestLog.forEach(entry => {
    const key = `${entry.service}.${entry.operation}`;
    operationCounts[key] = (operationCounts[key] || 0) + 1;
  });
  
  const errorCount = requestLog.filter(entry => !entry.response.success).length;
  const errorRate = Math.round((errorCount / requestLog.length) * 100);
  
  return {
    averageResponseTime,
    slowestOperation,
    fastestOperation,
    operationCounts,
    errorRate
  };
}
