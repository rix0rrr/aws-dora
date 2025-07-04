import React from 'react';

interface ApiRequestFormProps {
  service: string;
  operation: string;
  requestPayload: Record<string, unknown>;
  fieldMetadata: Record<string, { required: boolean }>;
}

export function ApiRequestForm({ service, operation, requestPayload, fieldMetadata }: ApiRequestFormProps): React.ReactElement {
  const jsonString = JSON.stringify(requestPayload, null, 2);
  
  return React.createElement('div', { className: 'h-full flex flex-col' }, [
    // Header
    React.createElement('div', {
      key: 'header',
      className: 'mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200'
    }, [
      React.createElement('h2', {
        key: 'title',
        className: 'text-lg font-semibold text-blue-800'
      }, `${service} - ${operation}`),
      React.createElement('p', {
        key: 'description',
        className: 'text-sm text-blue-600 mt-1'
      }, 'Edit the JSON payload below and click Execute to make the API call')
    ]),
    
    // Legend
    React.createElement('div', {
      key: 'legend',
      className: 'mb-3 flex items-center space-x-4 text-sm'
    }, [
      React.createElement('div', {
        key: 'required',
        className: 'flex items-center'
      }, [
        React.createElement('div', {
          key: 'required-color',
          className: 'w-3 h-3 bg-red-500 rounded mr-2'
        }),
        React.createElement('span', { key: 'required-text' }, 'Required fields')
      ]),
      React.createElement('div', {
        key: 'optional',
        className: 'flex items-center'
      }, [
        React.createElement('div', {
          key: 'optional-color',
          className: 'w-3 h-3 bg-green-500 rounded mr-2'
        }),
        React.createElement('span', { key: 'optional-text' }, 'Optional fields')
      ])
    ]),
    
    // JSON Editor
    React.createElement('div', {
      key: 'editor-container',
      className: 'flex-1 border border-gray-300 rounded-lg overflow-hidden'
    }, [
      React.createElement('textarea', {
        key: 'editor',
        id: 'json-editor',
        className: 'w-full h-full p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500',
        defaultValue: jsonString,
        placeholder: 'JSON request payload will appear here...'
      }),
      
      // Syntax highlighting overlay (will be handled by Prism.js)
      React.createElement('pre', {
        key: 'syntax-highlight',
        className: 'hidden'
      }, [
        React.createElement('code', {
          key: 'code',
          className: 'language-json',
          id: 'json-display'
        }, jsonString)
      ])
    ]),
    
    // Execute button
    React.createElement('div', {
      key: 'actions',
      className: 'mt-4 flex justify-between items-center'
    }, [
      React.createElement('div', {
        key: 'info',
        className: 'text-sm text-gray-600'
      }, 'Make sure to select credentials before executing'),
      
      React.createElement('button', {
        key: 'execute',
        className: 'px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center',
        'hx-post': '/execute',
        'hx-target': '#response-log',
        'hx-swap': 'beforeend',
        'hx-include': '#json-editor, #credentials-selector',
        'hx-vals': JSON.stringify({ service, operation }),
        'hx-indicator': '#execute-loading'
      }, [
        React.createElement('span', {
          key: 'loading',
          id: 'execute-loading',
          className: 'htmx-indicator mr-2'
        }, '⟳'),
        React.createElement('span', { key: 'text' }, 'Execute Request')
      ])
    ])
  ]);
}

export function EmptyRequestForm(): React.ReactElement {
  return React.createElement('div', {
    className: 'h-full flex items-center justify-center text-gray-500'
  }, [
    React.createElement('div', {
      key: 'content',
      className: 'text-center'
    }, [
      React.createElement('div', {
        key: 'icon',
        className: 'text-6xl mb-4'
      }, '📋'),
      React.createElement('h3', {
        key: 'title',
        className: 'text-lg font-medium mb-2'
      }, 'Select an API Operation'),
      React.createElement('p', {
        key: 'description',
        className: 'text-sm'
      }, 'Choose a service and operation from the tree on the left to see the request template')
    ])
  ]);
}
