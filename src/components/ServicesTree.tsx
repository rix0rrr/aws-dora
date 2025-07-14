import React from 'react';
import { AWSOperation, AWSResource, AWSService, AWSServiceList } from '../types/model';
import { AwsServiceModelView } from '../services/awsServices';

interface ServicesTreeProps {
  serviceModel: AwsServiceModelView;
}

export function ServicesTree({ serviceModel }: ServicesTreeProps): React.ReactElement {
  // Tree
  return React.createElement('div', { className: 'space-y-2' },
    serviceModel.services.map(service => ServicesTreeService({
      service,
      serviceModel,
    })),
  );
}


interface ServersTreeServiceProps {
  service: AWSService;
  serviceModel: AwsServiceModelView;
}

export function ServicesTreeService({ service, serviceModel }: ServersTreeServiceProps): React.ReactElement {
  const expanded = serviceModel.isExpanded(service);

  return <div key={service.shortName} className="expando">
    <h3
      key="header"
      className="p-2 text-lg font-light text-gray-600 bg-yellow-100 hover:bg-blue-50 hover:text-blue-700 cursor-pointer tracking-wide pointer"
      hx-post={`/tree/toggle/${service.nodeId}`}
      hx-target="closest .expando"
      hx-swap="outerHTML"
    >{service.name}</h3>

    {expanded
      ? <div className="ml-2">
        {service.resources.map(resource => ServicesTreeResource({ resource, serviceModel }) )}
        {service.operations.map(renderOperation)}
        </div>
      : undefined}
  </div>;
}

interface ServicesTreeResourceProps {
  resource: AWSResource;
  serviceModel: AwsServiceModelView;
}


export function ServicesTreeResource({ resource, serviceModel }: ServicesTreeResourceProps): React.ReactElement {
  const expanded = serviceModel.isExpanded(resource);

  return <div key={resource.name} className="expando space-y-1">
    <div
      key="resource-header"
      className="p-2 text-sm font-semibold text-gray-500 hover:bg-blue-50 hover:text-blue-700 uppercase cursor-pointer tracking-wide mb-2"
      hx-post={`/tree/toggle/${resource.nodeId}`}
      hx-target="closest .expando"
      hx-swap="outerHTML"
    >{resource.name}</div>

    {expanded
      ? <div className="ml-2">
        {resource.resources.map(resource => ServicesTreeResource({ resource, serviceModel }) )}
        {resource.operations.map(renderOperation)}
        </div>
      : undefined}
  </div>;
}

function renderOperation(op: AWSOperation): React.ReactElement {
  return <div
    key={op.operationId}
    className="tree-item p-2 text-sm text-gray-900 rounded cursor-pointer hover:bg-blue-50 hover:text-blue-700"
    hx-get={`/api-template/${op.operationId}`}
    hx-target="#request-form"
  >{op.name}</div>;
}

interface ResourceHaverProps {
  resources: AWSResource[];
  operations: AWSOperation[];
}

interface FilterBarProps {
  searchTerm?: string;
}

export function FilterBar({ searchTerm = '' }: FilterBarProps): React.ReactElement {
  return React.createElement('div', { className: 'mb-4' }, [
    React.createElement('input', {
      key: 'search',
      type: 'text',
      placeholder: 'Search services and operations...',
      className: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
      defaultValue: searchTerm,
      'hx-get': '/services/filter',
      'hx-target': '#services-tree',
      'hx-trigger': 'keyup changed delay:300ms',
      'hx-include': 'this',
      name: 'search'
    })
  ]);
}
