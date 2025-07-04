const { EC2Client } = require('@aws-sdk/client-ec2');
const { S3Client } = require('@aws-sdk/client-s3');
const { LambdaClient } = require('@aws-sdk/client-lambda');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { IAMClient } = require('@aws-sdk/client-iam');
const { STSClient } = require('@aws-sdk/client-sts');
const { getCredentialsConfig } = require('./credentialsManager');

// Map service names to their SDK clients and commands
const SERVICE_CLIENTS = {
  'EC2': {
    client: EC2Client,
    commands: {
      'DescribeInstances': () => require('@aws-sdk/client-ec2').DescribeInstancesCommand,
      'RunInstances': () => require('@aws-sdk/client-ec2').RunInstancesCommand,
      'TerminateInstances': () => require('@aws-sdk/client-ec2').TerminateInstancesCommand,
      'StartInstances': () => require('@aws-sdk/client-ec2').StartInstancesCommand,
      'StopInstances': () => require('@aws-sdk/client-ec2').StopInstancesCommand,
      'DescribeImages': () => require('@aws-sdk/client-ec2').DescribeImagesCommand,
      'CreateSecurityGroup': () => require('@aws-sdk/client-ec2').CreateSecurityGroupCommand,
      'DescribeSecurityGroups': () => require('@aws-sdk/client-ec2').DescribeSecurityGroupsCommand
    }
  },
  'S3': {
    client: S3Client,
    commands: {
      'ListBuckets': () => require('@aws-sdk/client-s3').ListBucketsCommand,
      'CreateBucket': () => require('@aws-sdk/client-s3').CreateBucketCommand,
      'DeleteBucket': () => require('@aws-sdk/client-s3').DeleteBucketCommand,
      'GetObject': () => require('@aws-sdk/client-s3').GetObjectCommand,
      'PutObject': () => require('@aws-sdk/client-s3').PutObjectCommand,
      'DeleteObject': () => require('@aws-sdk/client-s3').DeleteObjectCommand,
      'ListObjects': () => require('@aws-sdk/client-s3').ListObjectsCommand
    }
  },
  'Lambda': {
    client: LambdaClient,
    commands: {
      'ListFunctions': () => require('@aws-sdk/client-lambda').ListFunctionsCommand,
      'CreateFunction': () => require('@aws-sdk/client-lambda').CreateFunctionCommand,
      'DeleteFunction': () => require('@aws-sdk/client-lambda').DeleteFunctionCommand,
      'InvokeFunction': () => require('@aws-sdk/client-lambda').InvokeCommand,
      'UpdateFunctionCode': () => require('@aws-sdk/client-lambda').UpdateFunctionCodeCommand,
      'GetFunction': () => require('@aws-sdk/client-lambda').GetFunctionCommand
    }
  },
  'DynamoDB': {
    client: DynamoDBClient,
    commands: {
      'ListTables': () => require('@aws-sdk/client-dynamodb').ListTablesCommand,
      'CreateTable': () => require('@aws-sdk/client-dynamodb').CreateTableCommand,
      'DeleteTable': () => require('@aws-sdk/client-dynamodb').DeleteTableCommand,
      'GetItem': () => require('@aws-sdk/client-dynamodb').GetItemCommand,
      'PutItem': () => require('@aws-sdk/client-dynamodb').PutItemCommand,
      'UpdateItem': () => require('@aws-sdk/client-dynamodb').UpdateItemCommand,
      'DeleteItem': () => require('@aws-sdk/client-dynamodb').DeleteItemCommand,
      'Scan': () => require('@aws-sdk/client-dynamodb').ScanCommand,
      'Query': () => require('@aws-sdk/client-dynamodb').QueryCommand
    }
  },
  'IAM': {
    client: IAMClient,
    commands: {
      'ListUsers': () => require('@aws-sdk/client-iam').ListUsersCommand,
      'CreateUser': () => require('@aws-sdk/client-iam').CreateUserCommand,
      'DeleteUser': () => require('@aws-sdk/client-iam').DeleteUserCommand,
      'ListRoles': () => require('@aws-sdk/client-iam').ListRolesCommand,
      'CreateRole': () => require('@aws-sdk/client-iam').CreateRoleCommand,
      'DeleteRole': () => require('@aws-sdk/client-iam').DeleteRoleCommand,
      'ListPolicies': () => require('@aws-sdk/client-iam').ListPoliciesCommand,
      'CreatePolicy': () => require('@aws-sdk/client-iam').CreatePolicyCommand
    }
  }
};

// Execute AWS API call
async function executeApiCall(service, operation, payload, credentialInfo) {
  try {
    // Validate service and operation
    if (!SERVICE_CLIENTS[service]) {
      throw new Error(`Unsupported service: ${service}`);
    }
    
    if (!SERVICE_CLIENTS[service].commands[operation]) {
      throw new Error(`Unsupported operation: ${service}.${operation}`);
    }
    
    // Get credentials configuration
    const credentialsConfig = getCredentialsConfig(credentialInfo);
    
    // Create client
    const ClientClass = SERVICE_CLIENTS[service].client;
    const client = new ClientClass(credentialsConfig);
    
    // Get command class
    const CommandClass = SERVICE_CLIENTS[service].commands[operation]();
    
    // Create command with payload
    const command = new CommandClass(payload);
    
    // Execute the command
    const startTime = Date.now();
    const response = await client.send(command);
    const endTime = Date.now();
    
    return {
      success: true,
      service,
      operation,
      payload,
      response,
      duration: endTime - startTime,
      timestamp: new Date().toISOString(),
      credentialType: credentialInfo.type
    };
    
  } catch (error) {
    return {
      success: false,
      service,
      operation,
      payload,
      error: {
        name: error.name,
        message: error.message,
        code: error.Code || error.$metadata?.httpStatusCode,
        requestId: error.$metadata?.requestId
      },
      timestamp: new Date().toISOString(),
      credentialType: credentialInfo.type
    };
  }
}

// Validate JSON payload
function validatePayload(payloadString) {
  try {
    const payload = JSON.parse(payloadString);
    return { valid: true, payload };
  } catch (error) {
    return { 
      valid: false, 
      error: `Invalid JSON: ${error.message}` 
    };
  }
}

// Format response for display
function formatResponse(result) {
  if (result.success) {
    return {
      ...result,
      response: JSON.stringify(result.response, null, 2)
    };
  } else {
    return {
      ...result,
      error: JSON.stringify(result.error, null, 2)
    };
  }
}

module.exports = {
  executeApiCall,
  validatePayload,
  formatResponse
};
