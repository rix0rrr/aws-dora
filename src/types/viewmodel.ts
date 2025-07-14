export interface VMResourceHaver {
  nodeId: string;
  resources: VMResource[];
  operations: VMOperation[];
}

// AWS Service Types
export interface VMService extends VMResourceHaver {
  name: string;
  shortName: string;
}

export interface VMResource extends VMResourceHaver {
  name: string;
}

export interface VMOperation {
  name: string;
  operationId: string;
  description?: string;
  requestTemplate?: Record<string, unknown>;
}


