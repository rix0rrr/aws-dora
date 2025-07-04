import React from 'react';
import { LogEntry } from '../types';

interface LogStats {
  total: number;
  successful: number;
  failed: number;
}

interface RequestLoggerProps {
  logEntries?: LogEntry[];
  stats?: LogStats | null;
}

export function RequestLogger({ logEntries = [], stats = null }: RequestLoggerProps): React.ReactElement {
  return React.createElement('div', { className: 'h-full flex flex-col' }, [
    // Header with stats and controls
    React.createElement('div', {
      key: 'header',
      className: 'flex items-center justify-between p-4 border-b border-gray-200 bg-white'
    }, [
      React.createElement('div', {
        key: 'title-stats',
        className: 'flex items-center space-x-4'
      }, [
        React.createElement('h3', {
          key: 'title',
          className: 'text-lg font-medium text-gray-800'
        }, 'Request Log'),
        
        stats ? React.createElement('div', {
          key: 'stats',
          className: 'flex items-center space-x-3 text-sm text-gray-600'
        }, [
          React.createElement('span', {
            key: 'total',
            className: 'px-2 py-1 bg-blue-100 text-blue-800 rounded'
          }, `${stats.total} total`),
          React.createElement('span', {
            key: 'success',
            className: 'px-2 py-1 bg-green-100 text-green-800 rounded'
          }, `${stats.successful} success`),
          React.createElement('span', {
            key: 'failed',
            className: 'px-2 py-1 bg-red-100 text-red-800 rounded'
          }, `${stats.failed} failed`)
        ]) : null
      ]),
      
      React.createElement('div', {
        key: 'controls',
        className: 'flex items-center space-x-2'
      }, [
        React.createElement('button', {
          key: 'refresh',
          className: 'px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700',
          'hx-get': '/logs',
          'hx-target': '#response-log',
          'hx-swap': 'innerHTML'
        }, 'Refresh'),
        React.createElement('button', {
          key: 'clear',
          className: 'px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700',
          'hx-post': '/logs/clear',
          'hx-target': '#response-log',
          'hx-swap': 'innerHTML',
          'hx-confirm': 'Are you sure you want to clear the log?'
        }, 'Clear')
      ])
    ]),
    
    // Log entries
    React.createElement('div', {
      key: 'log-container',
      className: 'flex-1 overflow-y-auto p-4 space-y-4',
      id: 'log-entries'
    }, logEntries.length > 0 ? 
      logEntries.map(entry => renderLogEntry(entry)) :
      React.createElement('div', {
        className: 'text-center text-gray-500 py-8'
      }, [
        React.createElement('div', {
          key: 'icon',
          className: 'text-4xl mb-2'
        }, '📝'),
        React.createElement('p', {
          key: 'message'
        }, 'No requests logged yet. Execute an API call to see it here.')
      ])
    )
  ]);
}

function renderLogEntry(entry: LogEntry): React.ReactElement {
  const timestamp = entry.timestamp.toLocaleString();
  const success = entry.response.success;
  const statusClass = success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  const statusIcon = success ? '✅' : '❌';
  const statusText = success ? 'Success' : 'Error';
  
  return React.createElement('div', {
    key: entry.id,
    className: `border rounded-lg p-4 ${statusClass}`
  }, [
    // Header
    React.createElement('div', {
      key: 'header',
      className: 'flex items-center justify-between mb-3'
    }, [
      React.createElement('div', {
        key: 'info',
        className: 'flex items-center'
      }, [
        React.createElement('span', {
          key: 'icon',
          className: 'mr-2'
        }, statusIcon),
        React.createElement('span', {
          key: 'operation',
          className: 'font-medium'
        }, `${entry.service}.${entry.operation}`),
        React.createElement('span', {
          key: 'status',
          className: 'ml-2 text-sm text-gray-600'
        }, statusText)
      ]),
      React.createElement('div', {
        key: 'meta',
        className: 'text-sm text-gray-500'
      }, [
        React.createElement('div', { key: 'timestamp' }, timestamp),
        React.createElement('div', { key: 'creds' }, `${entry.request.credentials.type}${entry.duration ? ` • ${entry.duration}ms` : ''}`)
      ])
    ]),
    
    // Content (collapsible)
    React.createElement('div', {
      key: 'content',
      className: 'grid grid-cols-1 lg:grid-cols-2 gap-4'
    }, [
      // Request
      React.createElement('div', { key: 'request' }, [
        React.createElement('h5', {
          key: 'request-title',
          className: 'text-sm font-medium text-gray-700 mb-2'
        }, 'Request'),
        React.createElement('pre', {
          key: 'request-content',
          className: 'text-xs bg-gray-100 p-2 rounded overflow-x-auto max-h-32'
        }, [
          React.createElement('code', {
            key: 'request-code',
            className: 'language-json'
          }, JSON.stringify(entry.request.payload, null, 2))
        ])
      ]),
      
      // Response/Error
      React.createElement('div', { key: 'response' }, [
        React.createElement('h5', {
          key: 'response-title',
          className: 'text-sm font-medium text-gray-700 mb-2'
        }, success ? 'Response' : 'Error'),
        React.createElement('pre', {
          key: 'response-content',
          className: 'text-xs bg-gray-100 p-2 rounded overflow-x-auto max-h-32'
        }, [
          React.createElement('code', {
            key: 'response-code',
            className: 'language-json'
          }, success ? 
            JSON.stringify(entry.response.data, null, 2) : 
            JSON.stringify(entry.response.error, null, 2))
        ])
      ])
    ])
  ]);
}

export function EmptyRequestLogger(): React.ReactElement {
  return React.createElement('div', { className: 'h-full flex flex-col' }, [
    React.createElement('div', {
      key: 'header',
      className: 'flex items-center justify-between p-4 border-b border-gray-200 bg-white'
    }, [
      React.createElement('h3', {
        key: 'title',
        className: 'text-lg font-medium text-gray-800'
      }, 'Request Log'),
      React.createElement('div', {
        key: 'controls',
        className: 'flex items-center space-x-2'
      }, [
        React.createElement('button', {
          key: 'refresh',
          className: 'px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700',
          'hx-get': '/logs',
          'hx-target': '#response-log',
          'hx-swap': 'innerHTML'
        }, 'Refresh')
      ])
    ]),
    React.createElement('div', {
      key: 'empty',
      className: 'flex-1 flex items-center justify-center text-gray-500'
    }, [
      React.createElement('div', {
        key: 'content',
        className: 'text-center'
      }, [
        React.createElement('div', {
          key: 'icon',
          className: 'text-6xl mb-4'
        }, '📝'),
        React.createElement('h3', {
          key: 'title',
          className: 'text-lg font-medium mb-2'
        }, 'Request Log'),
        React.createElement('p', {
          key: 'description',
          className: 'text-sm'
        }, 'API requests and responses will appear here')
      ])
    ])
  ]);
}
