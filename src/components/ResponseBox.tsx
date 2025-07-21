import React from 'react';

export interface ResponseBoxProps {
  responseJson: string;
  duration: number;
  totalRetryDelay: number;
  requestId: string;
  attempts: number;
}

export function EmptyResponseBox(): React.ReactElement {
  return <div className="h-full flex items-center justify-center text-gray-500">
    <div className="text-center">
      <div className="text-6xl mb-4">📝</div>
      <h3 className="text-3xl font-medium mb-2 text-gray-300">Response</h3>
      <p className="text-sm">API responses will appear here.</p>
    </div>
  </div>;
}


interface ErrorResponseBoxProps {
  errorMessage: string;
}

export function ErrorResponseBox(props: ErrorResponseBoxProps): React.ReactElement {
  return <div className="h-full">
    <div className="bg-red-200 border border-red-300 rounded-lg px-4 py-2">
      <h3 className="text-md font-bold text-red-800">Error</h3>
      <p className="text-sm">{props.errorMessage}</p>
    </div>
  </div>;
}

export function ResponseBox(props: ResponseBoxProps): React.ReactElement {
  return <div className="flex flex-col h-full w-full">
    <h2 className="text-2xl font-light text-black">Response</h2>
    <div className="flex-1 overflow-auto w-full">
      <pre className="bg-white p-4 rounded-lg shadow-sm fit-content">
        <code className="language-js">
          {props.responseJson}
        </code>
      </pre>
    </div>
    <div className="text-sm text-gray-500 mt-2">
      RequestID {props.requestId}
      {props.duration ? ` • ${props.duration}ms` : ''}
      {props.totalRetryDelay ? ` • Total retry delay: ${props.totalRetryDelay}ms` : ''}
    </div>
  </div>;
}