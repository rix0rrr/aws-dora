import React from 'react';

interface ApiRequestFormProps {
  serviceName: string;
  operation: string;
  operationId: string;
  requestTemplate: string;
}

export function ApiRequestForm({ serviceName, operation, operationId, requestTemplate }: ApiRequestFormProps): React.ReactElement {
  const jsonString = requestTemplate;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-light text-orange-500">{operation}</h2>
        <div className="text-sm font-semibold text-gray-400">{serviceName}</div>
      </div>

      {/* Legend */}
      {/*
      <div className="mb-3 flex items-center space-x-4 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded mr-2" />
          <span>Required fields</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded mr-2" />
          <span>Optional fields</span>
        </div>
      </div>
      */}

      {/* JSON Editor */}
      <div className="flex-1 border border-gray-300 rounded-lg overflow-hidden">
        <textarea
          id="json-editor"
          name="request"
          className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 language-js"
          placeholder="JSON request payload will appear here..."
        >{jsonString}</textarea>
        {/* Syntax highlighting overlay (will be handled by Prism.js) */}
        <pre className="hidden">
          <code className="language-js" id="json-display">
            {jsonString}
          </code>
        </pre>
      </div>

      {/* Execute button */}
      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Make sure to select credentials before executing
        </div>
        <button
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
          hx-post={`/call/${operationId}`}
          hx-target="#response"
          hx-include="#json-editor, #credentials-selector"
          hx-indicator="#execute-loading"
        >
          <span id="execute-loading" className="htmx-indicator mr-2">
            ⟳
          </span>
          <span>Execute Request</span>
        </button>
      </div>
    </div>
  );
}

export function EmptyRequestForm(): React.ReactElement {
  return <div className="h-full flex items-center justify-center text-gray-500">
    <div className="text-center">
      <div className="text-6xl mb-4">📋</div>
      <h3 className="text-3xl font-medium mb-2 text-gray-300">Request</h3>
      <p className="text-sm">Choose an API call from the tree on the left.</p>
    </div>
  </div>;
}
