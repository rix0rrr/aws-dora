import React from 'react';
import { CredentialsSelectorProps, CredentialSource } from '../types';

interface ExtendedCredentialsSelectorProps extends CredentialsSelectorProps {
  selectedCredential?: CredentialSource | null;
}

export function CredentialsSelector({ credentials = [], selected, selectedCredential = null }: ExtendedCredentialsSelectorProps): React.ReactElement {
  return (
    <span>
      <label className="text-sm font-medium text-gray-700 mr-4" htmlFor="credentials-selector">
        AWS Credentials
      </label>
      <select
        id="credentials-selector"
        name="credentials"
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        hx-get="/credentials/select"
        hx-target="#credentials-info"
        hx-swap="innerHTML"
        hx-trigger="change"
        value={
          selectedCredential
            ? JSON.stringify(selectedCredential)
            : selected
            ? JSON.stringify(selected)
            : ''
        }
        onChange={() => {}}
      >
        <option value="">Select credentials...</option>
        {credentials.map((cred, index) => (
          <option
            key={index}
            value={JSON.stringify(cred)}
          >
            {cred.name}
          </option>
        ))}
      </select>
      <div id="credentials-info" className="mt-2">
        {(selectedCredential || selected) ? (
          <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
            <div>Type: {(selectedCredential || selected)?.type}</div>
            <div className="mt-1">
              Region: {(selectedCredential || selected)?.region || 'us-east-1'}
            </div>
          </div>
        ) : null}
      </div>
    </span>
  );
}

export function EmptyCredentialsSelector(): React.ReactElement {
  return React.createElement('div', { className: 'mb-4' }, [
    React.createElement('div', {
      key: 'warning',
      className: 'p-3 bg-yellow-50 border border-yellow-200 rounded-md'
    }, [
      React.createElement('div', {
        key: 'icon',
        className: 'flex items-center'
      }, [
        React.createElement('span', {
          key: 'icon-text',
          className: 'text-yellow-600 mr-2'
        }, '⚠️'),
        React.createElement('span', {
          key: 'message',
          className: 'text-sm text-yellow-800'
        }, 'No AWS credentials detected. Please configure credentials to make API calls.')
      ])
    ]),

    React.createElement('div', {
      key: 'help',
      className: 'mt-2 text-xs text-gray-500'
    }, [
      React.createElement('p', { key: 'help-text' }, 'You can configure credentials using:'),
      React.createElement('ul', { key: 'help-list', className: 'list-disc list-inside mt-1 ml-2' }, [
        React.createElement('li', { key: 'env' }, 'Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)'),
        React.createElement('li', { key: 'profile' }, 'AWS CLI profiles (~/.aws/credentials)'),
        React.createElement('li', { key: 'ec2' }, 'EC2 instance IAM roles')
      ])
    ])
  ]);
}
