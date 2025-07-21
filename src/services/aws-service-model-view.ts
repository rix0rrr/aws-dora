import * as fs from 'fs/promises';
import path from 'path';
import { RequestTemplate, FieldDefinition } from '../types';
import { AWSOperation, AWSResource, AWSResourceHaver, AWSService, AWSServiceList } from '../types/model';


export class AwsServiceModelView {
  public static async fromBuiltinModel(): Promise<AwsServiceModelView> {
    const services = await JSON.parse(await fs.readFile(path.join(__dirname, '../../data/aws-services.json'), 'utf-8'));
    return new AwsServiceModelView(services as AWSServiceList);
  }

  private readonly expanded = new Set<string>();
  private readonly services: AWSService[];
  private _currentFilter: string = '';

  constructor(services: AWSServiceList) {
    this.services = services.services;
  }

  public get currentFilter(): string {
    return this._currentFilter;
  }

  public setFilter(filter: string): void {
    this._currentFilter = filter;
  }

  public toggleExpanded(resourceHaver: AWSResourceHaver | string): void {
    const nodeId = typeof resourceHaver === 'string' ? resourceHaver : resourceHaver.nodeId;

    if (this.expanded.has(nodeId)) {
      this.expanded.delete(nodeId);
    } else {
      this.expanded.add(nodeId);
    }
  }

  public getNodeById(node: string, source: 'filtered' | 'all'): AWSResourceHaver | undefined {
    let ret: AWSResourceHaver | undefined;
    for (const service of source === 'filtered' ? this.filtered() : this.services) {
      recurse(service);
    }
    return ret;

    function recurse(resourceHaver: AWSResourceHaver) {
      if (resourceHaver.nodeId === node) {
        ret = resourceHaver;
        return;
      }

      for (const resource of resourceHaver.resources) {
        recurse(resource);
      }
    }
  }

  public getOperationById(id: string): { service: AWSService; operation: AWSOperation } | undefined {
    let ret: ReturnType<typeof this.getOperationById>;
    for (const service of this.services) {
      recurse(service, service);
    }
    return ret;

    function recurse(service: AWSService, resourceHaver: AWSResourceHaver) {
      for (const operation of resourceHaver.operations) {
        if (operation.operationId === id) {
          ret = { service, operation };
          return;
        }
      }

      for (const resource of resourceHaver.resources) {
        recurse(service, resource);
      }
    }
  }

  public isExpanded(resourceHaver: AWSResourceHaver): boolean {
    return this.expanded.has(resourceHaver.nodeId);
  }

  public filtered(): AWSService[] {
    if (this._currentFilter === '') {
      return this.services;
    }

    const self = this;

    return this.services
      .map(service => {
        if (this.matches(service.name) || this.matches(service.shortName)) {
          return service;
        }

        return {
          ...service,
          operations: service.operations.filter(matchingOperation),
          resources: service.resources.map(filterResourceMembers).filter(hasMembers),
        };
      }).filter(hasMembers);

    function matchingOperation(op: AWSOperation): boolean {
      const ret = self.matches(op.name) || self.matches(op.description || '');
      return ret;
    }

    function filterResourceMembers(resource: AWSResource): AWSResource {
      if (self.matches(resource.name)) {
        return resource;
      }

      return {
        ...resource,
        operations: resource.operations.filter(matchingOperation),
        resources: resource.resources.map(filterResourceMembers).filter(hasMembers),
      };
    }
  }

  private matches(haystack: string): boolean {
    return matches(this._currentFilter, haystack);
  }
}

function hasMembers(x: AWSResource | AWSService): boolean {
  return x.operations.length > 0 || x.resources.length > 0;
}

function matches(needle: string, haystack: string): boolean {
  const parts = needle.toLowerCase().split(/\s+/);
  haystack = haystack.toLowerCase();
  return parts.every(part => haystack.includes(part));
}

interface TemplateDefinition {
  required: Record<string, unknown>;
  optional: Record<string, unknown>;
}

// Generate request templates for common operations
export function getRequestTemplate(service: string, operation: string): RequestTemplate {
  const templates: Record<string, TemplateDefinition> = {
    // EC2 Templates
    'EC2.DescribeInstances': {
      required: {},
      optional: {
        InstanceIds: ['i-1234567890abcdef0'],
        Filters: [
          {
            Name: 'instance-state-name',
            Values: ['running'],
          },
        ],
        MaxResults: 10,
      },
    },
    'EC2.RunInstances': {
      required: {
        ImageId: 'ami-12345678',
        MinCount: 1,
        MaxCount: 1,
      },
      optional: {
        InstanceType: 't2.micro',
        KeyName: 'my-key-pair',
        SecurityGroupIds: ['sg-12345678'],
        SubnetId: 'subnet-12345678',
      },
    },

    // S3 Templates
    'S3.ListBuckets': {
      required: {},
      optional: {},
    },
    'S3.CreateBucket': {
      required: {
        Bucket: 'my-bucket-name',
      },
      optional: {
        CreateBucketConfiguration: {
          LocationConstraint: 'us-west-2',
        },
      },
    },
    'S3.GetObject': {
      required: {
        Bucket: 'my-bucket-name',
        Key: 'my-object-key',
      },
      optional: {
        Range: 'bytes=0-1023',
      },
    },

    // Lambda Templates
    'Lambda.ListFunctions': {
      required: {},
      optional: {
        MaxItems: 50,
      },
    },
    'Lambda.CreateFunction': {
      required: {
        FunctionName: 'my-function',
        Runtime: 'nodejs18.x',
        Role: 'arn:aws:iam::123456789012:role/lambda-role',
        Handler: 'index.handler',
        Code: {
          ZipFile: "exports.handler = async (event) => { return 'Hello World'; };",
        },
      },
      optional: {
        Description: 'My Lambda function',
        Timeout: 30,
        MemorySize: 128,
      },
    },

    // DynamoDB Templates
    'DynamoDB.ListTables': {
      required: {},
      optional: {
        Limit: 100,
      },
    },
    'DynamoDB.GetItem': {
      required: {
        TableName: 'my-table',
        Key: {
          id: {
            S: '123',
          },
        },
      },
      optional: {
        ConsistentRead: true,
      },
    },

    // IAM Templates
    'IAM.ListUsers': {
      required: {},
      optional: {
        MaxItems: 100,
      },
    },
    'IAM.CreateUser': {
      required: {
        UserName: 'new-user',
      },
      optional: {
        Path: '/',
        Tags: [
          {
            Key: 'Department',
            Value: 'Engineering',
          },
        ],
      },
    },
  };

  const key = `${service}.${operation}`;
  const template = templates[key] || {
    required: {},
    optional: {
      // Generic placeholder
      Parameter: 'value',
    },
  };

  // Generate field definitions
  const fields: Record<string, FieldDefinition> = {};

  Object.keys(template.required).forEach(field => {
    fields[field] = {
      type: inferType(template.required[field]),
      required: true,
      example: template.required[field],
    };
  });

  Object.keys(template.optional).forEach(field => {
    fields[field] = {
      type: inferType(template.optional[field]),
      required: false,
      example: template.optional[field],
    };
  });

  return {
    service,
    operation,
    template: { ...template.required, ...template.optional },
    fields,
  };
}

// Helper function to infer field type
function inferType(value: unknown): FieldDefinition['type'] {
  if (typeof value === 'string') return 'string';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object' && value !== null) return 'object';
  return 'string';
}

// Generate a complete request payload combining required and optional fields
export function generateRequestPayload(service: string, operation: string): Record<string, unknown> {
  const template = getRequestTemplate(service, operation);
  return template.template;
}

// Get field metadata for UI rendering
export function getFieldMetadata(service: string, operation: string): Record<string, { required: boolean }> {
  const template = getRequestTemplate(service, operation);
  const metadata: Record<string, { required: boolean }> = {};

  Object.keys(template.fields).forEach(field => {
    metadata[field] = { required: template.fields[field]?.required || false };
  });

  return metadata;
}
