// AWS Services data structure with common operations
const AWS_SERVICES = {
  'Compute': {
    'EC2': {
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
      operations: [
        'DescribeDBInstances',
        'CreateDBInstance',
        'DeleteDBInstance',
        'ModifyDBInstance',
        'RebootDBInstance'
      ]
    },
    'DynamoDB': {
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
      operations: [
        'ListMetrics',
        'GetMetricStatistics',
        'PutMetricData',
        'DescribeAlarms',
        'PutMetricAlarm'
      ]
    },
    'CloudTrail': {
      operations: [
        'DescribeTrails',
        'CreateTrail',
        'DeleteTrail',
        'LookupEvents'
      ]
    }
  }
};

// Generate request templates for common operations
function getRequestTemplate(service, operation) {
  const templates = {
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
  return templates[key] || {
    required: {},
    optional: {
      // Generic placeholder
      "Parameter": "value"
    }
  };
}

// Generate a complete request payload combining required and optional fields
function generateRequestPayload(service, operation) {
  const template = getRequestTemplate(service, operation);
  const payload = { ...template.required, ...template.optional };
  return payload;
}

// Get field metadata for UI rendering
function getFieldMetadata(service, operation) {
  const template = getRequestTemplate(service, operation);
  const metadata = {};
  
  // Mark required fields
  Object.keys(template.required).forEach(field => {
    metadata[field] = { required: true };
  });
  
  // Mark optional fields
  Object.keys(template.optional).forEach(field => {
    metadata[field] = { required: false };
  });
  
  return metadata;
}

// Get all services in a flat structure for filtering
function getAllServices() {
  const services = [];
  Object.keys(AWS_SERVICES).forEach(category => {
    Object.keys(AWS_SERVICES[category]).forEach(service => {
      services.push({
        category,
        service,
        operations: AWS_SERVICES[category][service].operations
      });
    });
  });
  return services;
}

// Filter services based on search term
function filterServices(searchTerm) {
  if (!searchTerm) return AWS_SERVICES;
  
  const filtered = {};
  const term = searchTerm.toLowerCase();
  
  Object.keys(AWS_SERVICES).forEach(category => {
    const categoryServices = {};
    let hasMatches = false;
    
    Object.keys(AWS_SERVICES[category]).forEach(service => {
      if (service.toLowerCase().includes(term) || 
          category.toLowerCase().includes(term) ||
          AWS_SERVICES[category][service].operations.some(op => 
            op.toLowerCase().includes(term))) {
        categoryServices[service] = AWS_SERVICES[category][service];
        hasMatches = true;
      }
    });
    
    if (hasMatches) {
      filtered[category] = categoryServices;
    }
  });
  
  return filtered;
}

module.exports = {
  AWS_SERVICES,
  getRequestTemplate,
  generateRequestPayload,
  getFieldMetadata,
  getAllServices,
  filterServices
};
