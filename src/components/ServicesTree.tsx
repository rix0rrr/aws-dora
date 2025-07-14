import React from 'react';
import { AWSOperation, AWSResource, AWSService, AWSServiceList } from '../types/model';
import { AwsServiceModelView } from '../services/aws-service-model-view';

interface ServicesTreeProps {
  serviceModel: AwsServiceModelView;
}

export function ServicesTree({ serviceModel }: ServicesTreeProps): React.ReactElement {
  // Tree
  return React.createElement('div', { className: 'space-y-2' },
    serviceModel.filtered().map(service => ServicesTreeService({
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
      className="p-2 text-md font-light text-gray-600 bg-yellow-100 hover:bg-blue-50 hover:text-blue-700 cursor-pointer tracking-wide pointer"
      hx-post={`/tree/toggle/${service.nodeId}`}
      hx-target="closest .expando"
      hx-swap="outerHTML"
    >{service.name}</h3>

    {expanded
      ? <div className="ml-4">
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

  const chevron = expanded ? 'fa-solid fa-chevron-down' : 'fa-solid fa-chevron-right';

  return <div key={resource.name} className="expando space-y-1">
    <div
      key="resource-header"
      className="border rounded-md border-gray-300 p-2 text-sm font-semibold text-gray-500 hover:bg-blue-50 hover:text-blue-700 uppercase cursor-pointer tracking-wide mb-2"
      hx-post={`/tree/toggle/${resource.nodeId}`}
      hx-target="closest .expando"
      hx-swap="outerHTML"
    ><span className={chevron}></span> {resource.name}</div>

    {expanded
      ? <div className="ml-4">
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
