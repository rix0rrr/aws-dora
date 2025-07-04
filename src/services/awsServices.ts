import { AWSServices, RequestTemplate, FieldDefinition } from '../types';

// AWS Services data structure with common operations
export const AWS_SERVICES: AWSServices = {
  'Compute': {
    'EC2': {
      name: 'EC2',
      operations: [
        'DescribeInstances',
        'RunInstances',
        'TerminateInstances',
        'StartInstances',
        'StopInstances',
        'DescribeImages',
        'CreateSecurityGroup',
        'DescribeSecurityGroups'
      ]
    },
    'Lambda': {
      name: 'Lambda',
      operations: [
        'ListFunctions',
        'CreateFunction',
        'DeleteFunction',
        'InvokeFunction',
        'UpdateFunctionCode',
        'GetFunction'
      ]
    },
    'ECS': {
      name: 'ECS',
      operations: [
        'ListClusters',
        'CreateCluster',
        'DeleteCluster',
        'ListServices',
        'CreateService',
        'UpdateService'
      ]
    }
  },
  'Storage': {
    'S3': {
      name: 'S3',
      operations: [
        'ListBuckets',
        'CreateBucket',
        'DeleteBucket',
        'GetObject',
        'PutObject',
        'DeleteObject',
        'ListObjects'
      ]
    },
    'EBS': {
      name: 'EBS',
      operations: [
        'DescribeVolumes',
        'CreateVolume',
        'DeleteVolume',
        'AttachVolume',
        'DetachVolume'
      ]
    }
  },
  'Database': {
    'RDS': {
      name: 'RDS',
      operations: [
        'DescribeDBInstances',
        'CreateDBInstance',
        'DeleteDBInstance',
        'ModifyDBInstance',
        'RebootDBInstance'
      ]
    },
    'DynamoDB': {
      name: 'DynamoDB',
      operations: [
        'ListTables',
        'CreateTable',
        'DeleteTable',
        'GetItem',
        'PutItem',
        'UpdateItem',
        'DeleteItem',
        'Scan',
        'Query'
      ]
    }
  },
  'Networking': {
    'VPC': {
      name: 'VPC',
      operations: [
        'DescribeVpcs',
        'CreateVpc',
        'DeleteVpc',
        'DescribeSubnets',
        'CreateSubnet',
        'DeleteSubnet'
      ]
    },
    'CloudFront': {
      name: 'CloudFront',
      operations: [
        'ListDistributions',
        'CreateDistribution',
        'GetDistribution',
        'UpdateDistribution',
        'DeleteDistribution'
      ]
    }
  },
  'Security': {
    'IAM': {
      name: 'IAM',
      operations: [
        'ListUsers',
        'CreateUser',
        'DeleteUser',
        'ListRoles',
        'CreateRole',
        'DeleteRole',
        'ListPolicies',
        'CreatePolicy'
      ]
    },
    'KMS': {
      name: 'KMS',
      operations: [
        'ListKeys',
        'CreateKey',
        'DescribeKey',
        'Encrypt',
        'Decrypt',
        'GenerateDataKey'
      ]
    }
  },
  'Monitoring': {
    'CloudWatch': {
      name: 'CloudWatch',
      operations: [
        'ListMetrics',
        'GetMetricStatistics',
        'PutMetricData',
        'DescribeAlarms',
        'PutMetricAlarm'
      ]
    },
    'CloudTrail': {
      name: 'CloudTrail',
      operations: [
        'DescribeTrails',
        'CreateTrail',
        'DeleteTrail',
        'LookupEvents'
      ]
    }
  }
};

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

// Get all services in a flat structure for filtering
export function getAllServices(): ServiceInfo[] {
  const services: ServiceInfo[] = [];
  Object.keys(AWS_SERVICES).forEach(category => {
    Object.keys(AWS_SERVICES[category]).forEach(service => {
      const serviceData = AWS_SERVICES[category]?.[service];
      if (serviceData) {
        services.push({
          category,
          service,
          operations: serviceData.operations
        });
      }
    });
  });
  return services;
}

// Filter services based on search term
export function filterServices(searchTerm: string): AWSServices {
  if (!searchTerm) return AWS_SERVICES;
  
  const filtered: AWSServices = {};
  const term = searchTerm.toLowerCase();
  
  Object.keys(AWS_SERVICES).forEach(category => {
    const categoryServices: typeof AWS_SERVICES[string] = {};
    let hasMatches = false;
    
    Object.keys(AWS_SERVICES[category] || {}).forEach(service => {
      const serviceData = AWS_SERVICES[category]?.[service];
      if (serviceData && (
        service.toLowerCase().includes(term) || 
        category.toLowerCase().includes(term) ||
        serviceData.operations.some(op => op.toLowerCase().includes(term))
      )) {
        categoryServices[service] = serviceData;
        hasMatches = true;
      }
    });
    
    if (hasMatches) {
      filtered[category] = categoryServices;
    }
  });
  
  return filtered;
}
