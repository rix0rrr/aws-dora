import React from 'react';
import { CredentialSource } from '../types';
import { ALL_REGIONS, CredentialViewModel } from '../services/credentialsManager';

export function CredentialsCorner(vm: CredentialViewModel) {
  return <div id='credentials-corner'>
    {CredentialsSelector({
      credentials: vm.credentials,
      selectedCredential: vm.selectedCredential
    })}
    {RegionSelector({
      selectedRegion: vm.selectedRegion,
      defaultRegion: vm.selectedCredential?.defaultRegion
    })}
  </div>;
}

interface CredentialsSelectorProps {
  credentials: CredentialSource[];
  selectedCredential?: CredentialSource;
}

function CredentialsSelector({ credentials, selectedCredential }: CredentialsSelectorProps): React.ReactElement {
  return (
    <span>
      <label className="text-sm font-medium text-gray-700 ml-4 mr-2" htmlFor="credentials-selector">
        Credentials
      </label>
      <select
        id="credentials-selector"
        name="credentials"
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        hx-post="/credentials/select-credential"
        hx-target="#credentials-corner"
        hx-trigger="change"
        defaultValue={
          selectedCredential
            ? JSON.stringify(selectedCredential)
            : ''
        }
      >
        <option value="">Select credentials...</option>
        {credentials.map((cred, index) => (
          <option key={index} value={JSON.stringify(cred)}>
            {cred.name}
          </option>
        ))}
      </select>
    </span>
  );
}

export interface RegionSelectorProps {
  selectedRegion?: string;
  defaultRegion?: string;
}

function RegionSelector({ defaultRegion, selectedRegion }: RegionSelectorProps): React.ReactElement {
  const regions = [
    ...ALL_REGIONS.map(region => [region, region]),
  ];
  if (defaultRegion) {
    regions.unshift([`${defaultRegion} (default)`, 'credential-default']);
  }

  return (
    <span>
      <label className="text-sm font-medium text-gray-700 ml-4 mr-2" htmlFor="region-selector">
        Region
      </label>
      <select
        id="region-selector"
        name="region"
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        defaultValue={selectedRegion ?? (defaultRegion ? 'credential-default' : '')}
        hx-post="/credentials/select-region"
        hx-target="#credentials-corner"
        hx-trigger="change"
      >
        <option value="">Select region...</option>
        {regions.map(([regionName, regionKey], index) => (
          <option key={index} value={regionKey}>
            {regionName}
          </option>
        ))}
      </select>
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
