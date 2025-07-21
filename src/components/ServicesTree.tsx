import React from 'react';
import { AwsServiceModelView } from '../services/aws-service-model-view';
import { AWSOperation, AWSResource, AWSService } from '../types/model';

interface ServicesTreeProps {
  serviceModel: AwsServiceModelView;
}

export function ServicesTree({ serviceModel }: ServicesTreeProps): React.ReactElement {
  // Tree
  return <div>
    {serviceModel.filtered().map(service => ServicesTreeService({
      service,
      serviceModel,
    }))}
  </div>;
}

interface ServersTreeServiceProps {
  service: AWSService;
  serviceModel: AwsServiceModelView;
}

export function ServicesTreeService({ service, serviceModel }: ServersTreeServiceProps): React.ReactElement {
  const expanded = serviceModel.isExpanded(service);

  const chevron = expanded ? 'fa-solid fa-circle-chevron-down' : 'fa-solid fa-circle-chevron-right';

  return <div key={service.shortName} className="expando">
    <h3
      key="header"
      className="p-2 text-md font-light text-gray-600 hover:bg-blue-50 hover:text-blue-700 cursor-pointer tracking-wide pointer whitespace-nowrap overflow-hidden"
      hx-post={`/tree/toggle/${service.nodeId}`}
      hx-target="closest .expando"
      hx-swap="outerHTML"
      title={service.name}
    ><span className={`${chevron} text-orange-300 mr-2`}></span> {service.name}</h3>

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

  return <div key={resource.name} className="expando">
    <div
      key="resource-header"
      className="border rounded-md border-blue-200 my-2 p-2 text-sm font-semibold text-orange-400 hover:bg-blue-50 hover:text-blue-700 uppercase cursor-pointer tracking-wide whitespace-nowrap overflow-hidden"
      hx-post={`/tree/toggle/${resource.nodeId}`}
      hx-target="closest .expando"
      hx-swap="outerHTML"
      title={resource.name}
    ><span className={`${chevron} text-orange-300 mr-2`}></span> {resource.name}</div>

    {expanded
      ? <div className="ml-4">
        {resource.resources.map(res => ServicesTreeResource({ resource: res, serviceModel }) )}
        {resource.operations.map(renderOperation)}
      </div>
      : undefined}
  </div>;
}

function renderOperation(op: AWSOperation): React.ReactElement {
  return <div
    key={op.operationId}
    className="tree-item p-2 text-sm text-gray-900 rounded cursor-pointer hover:bg-blue-50 hover:text-blue-700 whitespace-nowrap overflow-hidden"
    hx-get={`/call/${op.operationId}`}
    hx-target="#request-form"
    title={op.name}
  >{op.name}</div>;
}
