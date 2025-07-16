import React from 'react';

export interface ResponseBoxProps {
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
  return <div>
    <h2 className="text-2xl font-light text-black">Response</h2>
  </div>;
}