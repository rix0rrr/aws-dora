import { ResourceHaver } from "./smithy";

export interface AWSServiceList {
  services: AWSService[];
}

export interface AWSResourceHaver {
  nodeId: string;
  resources: AWSResource[];
  operations: AWSOperation[];
}

// AWS Service Types
export interface AWSService extends AWSResourceHaver {
  name: string;
  shortName: string;
}

export interface AWSResource extends AWSResourceHaver {
  name: string;
}

export interface AWSOperation {
  name: string;
  operationId: string;
  description?: string;
  requestTemplate?: Record<string, unknown>;
}

export function isService(x: AWSResourceHaver): x is AWSService {
  return (x as AWSService).shortName !== undefined;
}

export function isResource(x: AWSResourceHaver): x is AWSResource {
  return (x as AWSService).shortName === undefined;
}