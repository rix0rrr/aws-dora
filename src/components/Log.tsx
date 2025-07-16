import React from 'react';
import { LogEntry } from '../types';

interface LogStats {
  total: number;
  successful: number;
  failed: number;
}

interface RequestLogProps {
  logEntries?: LogEntry[];
  stats?: LogStats | null;
}

export function RequestLog({ logEntries = [], stats = null }: RequestLogProps): React.ReactElement {
  return (
    <div className="h-full flex flex-col">
      {/* Header with stats and controls */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white" key="header">
        <div className="flex items-center space-x-4" key="title-stats">
          <h3 className="text-lg font-medium text-gray-800" key="title">Request Log</h3>
          {stats && (
            <div className="flex items-center space-x-3 text-sm text-gray-600" key="stats">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded" key="total">{stats.total} total</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded" key="success">{stats.successful} success</span>
              <span className="px-2 py-1 bg-red-100 text-red-800 rounded" key="failed">{stats.failed} failed</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2" key="controls">
          <button
            key="refresh"
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            hx-get="/logs"
            hx-target="#response-log"
            hx-swap="innerHTML"
          >
            Refresh
          </button>
          <button
            key="clear"
            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            hx-post="/logs/clear"
            hx-target="#response-log"
            hx-swap="innerHTML"
            hx-confirm="Are you sure you want to clear the log?"
          >
            Clear
          </button>
        </div>
      </div>
      {/* Log entries */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" id="log-entries" key="log-container">
        {logEntries.length > 0 ? (
          logEntries.map(entry => renderLogEntry(entry))
        ) : (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-2" key="icon">📝</div>
            <p key="message">No requests logged yet. Execute an API call to see it here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function renderLogEntry(entry: LogEntry): React.ReactElement {
  const timestamp = entry.timestamp.toLocaleString();
  const success = entry.response.success;
  const statusClass = success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  const statusIcon = success ? '✅' : '❌';
  const statusText = success ? 'Success' : 'Error';

  return (
    <div key={entry.id} className={`border rounded-lg p-4 ${statusClass}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <span className="mr-2">{statusIcon}</span>
          <span className="font-medium">{entry.service}.{entry.operation}</span>
          <span className="ml-2 text-sm text-gray-600">{statusText}</span>
        </div>
        <div className="text-sm text-gray-500">
          <div>{timestamp}</div>
          <div>
            {entry.request.credentials.type}
            {entry.duration ? ` • ${entry.duration}ms` : ''}
          </div>
        </div>
      </div>

      {/* Content (collapsible) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Request */}
        <div>
          <h5 className="text-sm font-medium text-gray-700 mb-2">Request</h5>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto max-h-32">
            <code className="language-json">
              {JSON.stringify(entry.request.payload, null, 2)}
            </code>
          </pre>
        </div>

        {/* Response/Error */}
        <div>
          <h5 className="text-sm font-medium text-gray-700 mb-2">{success ? 'Response' : 'Error'}</h5>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto max-h-32">
            <code className="language-json">
              {success
                ? JSON.stringify(entry.response.data, null, 2)
                : JSON.stringify(entry.response.error, null, 2)}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}

export function EmptyRequestLogger(): React.ReactElement {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white" key="header">
        <h3 className="text-lg font-medium text-gray-800" key="title">Request Log</h3>
        <div className="flex items-center space-x-2" key="controls">
          <button
            key="refresh"
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            hx-get="/logs"
            hx-target="#response-log"
            hx-swap="innerHTML"
          >
            Refresh
          </button>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center text-gray-500" key="empty">
        <div className="text-center" key="content">
          <div className="text-6xl mb-4" key="icon">📝</div>
          <h3 className="text-lg font-medium mb-2" key="title">Request Log</h3>
          <p className="text-sm" key="description">API requests and responses will appear here</p>
        </div>
      </div>
    </div>
  );
}
