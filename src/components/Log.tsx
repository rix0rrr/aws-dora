import React from 'react';
import { LogEntry, RequestLog } from '../services/request-log';

export interface RequestLogProps {
  requestLog: RequestLog;
}

export function Log(props: RequestLogProps): React.ReactElement {
  return (
    <div className="h-full flex flex-col">
      {/* Header with stats and controls */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white" key="header">
        <div className="flex items-center space-x-4" key="title-stats">
          <h3 className="text-lg font-medium text-gray-800" key="title">Request Log</h3>
        </div>
        <div className="flex items-center space-x-2" key="controls">
          <button
            key="clear"
            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            hx-post="/logs/clear"
            hx-target="#logs-sidebar">
            Clear
          </button>
        </div>
      </div>
      {/* Log entries */}
      <div className="flex-1 overflow-y-auto space-y-2 bg-gray-50" id="log-entries">
        {props.requestLog.logs.length > 0 ? (
          Array.from(pairwise(props.requestLog.logs)).flatMap(([entry, nextEntry]) => (
            [
              RenderLogEntry(entry),
              ...nextEntry ? [renderSeparator(entry, nextEntry)] : [],
            ]
          ))
        ) : (
          <div className="text-center mt-10" key="content">
            <div className="text-6xl mb-4" key="icon">📝</div>
            <h3 className="text-3xl font-medium mb-2 text-gray-300">Log</h3>
            <p className="text-sm text-gray-500">History of all API calls here.</p>
          </div>
        )}
      </div>
      <div id="log-bottom"></div>
    </div>
  );
}

function RenderLogEntry(entry: LogEntry): React.ReactElement {
  const timestamp = entry.timestamp.toISOString();

  return (
    <div className="text-sm p-2">
      {/* Header */}
      <h3 className="font-light text-orange-500 text-lg"
        title={`${timestamp} ${entry.region} ${entry.credentials.type}`}
      >{entry.operation}</h3>

      {/* Content (collapsible) */}
      <div>
        {/* Request */}
        <div>
          <h5 className="text-sm font-medium text-gray-700 mb-2">Request</h5>
          <pre className="text-2xs overflow-x-auto border-none">
            <code className="language-js border-none">
              {entry.request}
            </code>
          </pre>
        </div>

        {/* Response/Error */}
        <div>
          <h5 className="text-sm font-medium text-gray-700 mb-2">Response</h5>
          <pre className="text-2xs overflow-x-auto">
            <code className="language-js">
              {entry.response}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}

function renderSeparator(entry: LogEntry, nextEntry: LogEntry): React.ReactElement {
  if (entry.region !== nextEntry.region) {
    return <div className="relative flex items-center">
      <div className="flex-grow border-t border-gray-200"></div>
      <span className="bg-white border-gray-400 shadow rounded-full text-xs flex-shrink py-1 px-2 text-gray-600">{nextEntry.region}</span>
      <div className="flex-grow border-t border-gray-200"></div>
    </div>;
  }

  return <div className="relative flex items-center">
    <div className="flex-grow border-t border-gray-200"></div>
  </div>;
}

function* pairwise<T>(arr: T[]): IterableIterator<[T, T | undefined]> {
  for (let i = 0; i < arr.length; i += 1) {
    if (i + 1 < arr.length) {
      yield [arr[i], arr[i + 1]];
    } else {
      yield [arr[i], undefined];
    }
  }
}