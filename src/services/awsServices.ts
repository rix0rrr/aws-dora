import * as fs from 'fs/promises';
import { RequestTemplate, FieldDefinition } from '../types';
import { AWSOperation, AWSResource, AWSResourceHaver, AWSService, AWSServiceList } from '../types/model';
import path from 'path';


export class AwsServiceModelView {
  public static async fromBuiltinModel(): Promise<AwsServiceModelView> {
    const services = await JSON.parse(await fs.readFile(path.join(__dirname, '../data/aws-services.json'), 'utf-8'));
    return new AwsServiceModelView(services as AWSServiceList);
  }

  private readonly expanded = new Set<string>();
  public readonly services: AWSService[];
  private readonly nodeIdMap = new Map<string, AWSResourceHaver>();

  constructor(services: AWSServiceList) {
    this.services = services.services;

    this.indexNodeIds();
  }

  public toggleExpanded(resourceHaver: AWSResourceHaver | string): void {
    const nodeId = typeof resourceHaver === 'string' ? resourceHaver : resourceHaver.nodeId;

    if (this.expanded.has(nodeId)) {
      this.expanded.delete(nodeId);
    } else {
      this.expanded.add(nodeId);
    }
  }

  public getNodeById(node: string) {
    const ret = this.nodeIdMap.get(node);
    if (!ret) {
      throw new Error(`Node with ID ${node} not found in AWS service model`);
    }
    return ret;
  }

  public isExpanded(resourceHaver: AWSResourceHaver): boolean {
    return this.expanded.has(resourceHaver.nodeId);
  }

  public filtered(searchTerm: string): AWSServiceList {
    return {
      services: this.services
        .map(service => {
          if (matches(searchTerm, service.name) || matches(searchTerm, service.shortName)) {
            return service;
          }

          return {
            ...service,
            operations: service.operations
              .filter(matchingOperation),
            resources: service.resources
              .map(filterResourceMembers)
              .filter(hasMembers),
          };
        })
        .filter(hasMembers),
    };

    function matchingOperation(op: AWSOperation): boolean {
      return matches(searchTerm, op.name) || matches(searchTerm, op.description || '');
    }

    function filterResourceMembers(resource: AWSResource): AWSResource {
      return {
        ...resource,
        operations: resource.operations.filter(matchingOperation),
        resources: resource.resources.map(filterResourceMembers)
      };
    }
  }

  private indexNodeIds() {
    const self = this;
    for (const service of this.services) {
      recurse(service);
    }

    function recurse(resourceHaver: AWSResourceHaver) {
      self.nodeIdMap.set(resourceHaver.nodeId, resourceHaver);

      for (const resource of resourceHaver.resources) {
        recurse(resource);
      }
    }
  }
}

function hasMembers(x: AWSResource | AWSService): boolean {
  return x.operations.length > 0 || x.resources.length > 0;
}

function matches(needle: string, haystack: string): boolean {
  return haystack.toLowerCase().includes(needle.toLowerCase());
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
        InstanceIds: ["i-1234567890abcdef0"],
        Filters: [
          {
            Name: "instance-state-name",
            Values: ["running"]
          }
        ],
        MaxResults: 10
      }
    },
    'EC2.RunInstances': {
      required: {
        ImageId: "ami-12345678",
        MinCount: 1,
        MaxCount: 1
      },
      optional: {
        InstanceType: "t2.micro",
        KeyName: "my-key-pair",
        SecurityGroupIds: ["sg-12345678"],
        SubnetId: "subnet-12345678"
      }
    },

    // S3 Templates
    'S3.ListBuckets': {
      required: {},
      optional: {}
    },
    'S3.CreateBucket': {
      required: {
        Bucket: "my-bucket-name"
      },
      optional: {
        CreateBucketConfiguration: {
          LocationConstraint: "us-west-2"
        }
      }
    },
    'S3.GetObject': {
      required: {
        Bucket: "my-bucket-name",
        Key: "my-object-key"
      },
      optional: {
        Range: "bytes=0-1023"
      }
    },

    // Lambda Templates
    'Lambda.ListFunctions': {
      required: {},
      optional: {
        MaxItems: 50
      }
    },
    'Lambda.CreateFunction': {
      required: {
        FunctionName: "my-function",
        Runtime: "nodejs18.x",
        Role: "arn:aws:iam::123456789012:role/lambda-role",
        Handler: "index.handler",
        Code: {
          ZipFile: "exports.handler = async (event) => { return 'Hello World'; };"
        }
      },
      optional: {
        Description: "My Lambda function",
        Timeout: 30,
        MemorySize: 128
      }
    },

    // DynamoDB Templates
    'DynamoDB.ListTables': {
      required: {},
      optional: {
        Limit: 100
      }
    },
    'DynamoDB.GetItem': {
      required: {
        TableName: "my-table",
        Key: {
          "id": {
            "S": "123"
          }
        }
      },
      optional: {
        ConsistentRead: true
      }
    },

    // IAM Templates
    'IAM.ListUsers': {
      required: {},
      optional: {
        MaxItems: 100
      }
    },
    'IAM.CreateUser': {
      required: {
        UserName: "new-user"
      },
      optional: {
        Path: "/",
        Tags: [
          {
            Key: "Department",
            Value: "Engineering"
          }
        ]
      }
    }
  };

  const key = `${service}.${operation}`;
  const template = templates[key] || {
    required: {},
    optional: {
      // Generic placeholder
      "Parameter": "value"
    }
  };

  // Generate field definitions
  const fields: Record<string, FieldDefinition> = {};

  Object.keys(template.required).forEach(field => {
    fields[field] = {
      type: inferType(template.required[field]),
      required: true,
      example: template.required[field]
    };
  });

  Object.keys(template.optional).forEach(field => {
    fields[field] = {
      type: inferType(template.optional[field]),
      required: false,
      example: template.optional[field]
    };
  });

  return {
    service,
    operation,
    template: { ...template.required, ...template.optional },
    fields
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

interface ServiceInfo {
  category: string;
  service: string;
  operations: string[];
}
