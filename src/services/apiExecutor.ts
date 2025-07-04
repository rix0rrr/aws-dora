import { EC2Client, DescribeInstancesCommand, RunInstancesCommand, TerminateInstancesCommand, StartInstancesCommand, StopInstancesCommand, DescribeImagesCommand, CreateSecurityGroupCommand, DescribeSecurityGroupsCommand } from '@aws-sdk/client-ec2';
import { S3Client, ListBucketsCommand, CreateBucketCommand, DeleteBucketCommand, GetObjectCommand, PutObjectCommand, DeleteObjectCommand, ListObjectsCommand } from '@aws-sdk/client-s3';
import { LambdaClient, ListFunctionsCommand, CreateFunctionCommand, DeleteFunctionCommand, InvokeCommand, UpdateFunctionCodeCommand, GetFunctionCommand } from '@aws-sdk/client-lambda';
import { DynamoDBClient, ListTablesCommand, CreateTableCommand, DeleteTableCommand, GetItemCommand, PutItemCommand, UpdateItemCommand, DeleteItemCommand, ScanCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import { IAMClient, ListUsersCommand, CreateUserCommand, DeleteUserCommand, ListRolesCommand, CreateRoleCommand, DeleteRoleCommand, ListPoliciesCommand, CreatePolicyCommand } from '@aws-sdk/client-iam';
import { STSClient } from '@aws-sdk/client-sts';

import { CredentialSource, APIRequest, APIResponse, APIError } from '../types';
import { getCredentialsConfig } from './credentialsManager';

// Define command constructor type - simplified
type CommandConstructor = new (input: any) => any;

// Define client constructor type - simplified
type ClientConstructor = new (config: any) => {
  send: (command: any) => Promise<any>;
};

// Service client configuration
interface ServiceConfig {
  client: ClientConstructor;
  commands: Record<string, () => CommandConstructor>;
}

// Map service names to their SDK clients and commands
const SERVICE_CLIENTS: Record<string, ServiceConfig> = {
  'EC2': {
    client: EC2Client as any,
    commands: {
      'DescribeInstances': () => DescribeInstancesCommand as any,
      'RunInstances': () => RunInstancesCommand as any,
      'TerminateInstances': () => TerminateInstancesCommand as any,
      'StartInstances': () => StartInstancesCommand as any,
      'StopInstances': () => StopInstancesCommand as any,
      'DescribeImages': () => DescribeImagesCommand as any,
      'CreateSecurityGroup': () => CreateSecurityGroupCommand as any,
      'DescribeSecurityGroups': () => DescribeSecurityGroupsCommand as any
    }
  },
  'S3': {
    client: S3Client as any,
    commands: {
      'ListBuckets': () => ListBucketsCommand as any,
      'CreateBucket': () => CreateBucketCommand as any,
      'DeleteBucket': () => DeleteBucketCommand as any,
      'GetObject': () => GetObjectCommand as any,
      'PutObject': () => PutObjectCommand as any,
      'DeleteObject': () => DeleteObjectCommand as any,
      'ListObjects': () => ListObjectsCommand as any
    }
  },
  'Lambda': {
    client: LambdaClient as any,
    commands: {
      'ListFunctions': () => ListFunctionsCommand as any,
      'CreateFunction': () => CreateFunctionCommand as any,
      'DeleteFunction': () => DeleteFunctionCommand as any,
      'InvokeFunction': () => InvokeCommand as any,
      'UpdateFunctionCode': () => UpdateFunctionCodeCommand as any,
      'GetFunction': () => GetFunctionCommand as any
    }
  },
  'DynamoDB': {
    client: DynamoDBClient as any,
    commands: {
      'ListTables': () => ListTablesCommand as any,
      'CreateTable': () => CreateTableCommand as any,
      'DeleteTable': () => DeleteTableCommand as any,
      'GetItem': () => GetItemCommand as any,
      'PutItem': () => PutItemCommand as any,
      'UpdateItem': () => UpdateItemCommand as any,
      'DeleteItem': () => DeleteItemCommand as any,
      'Scan': () => ScanCommand as any,
      'Query': () => QueryCommand as any
    }
  },
  'IAM': {
    client: IAMClient as any,
    commands: {
      'ListUsers': () => ListUsersCommand as any,
      'CreateUser': () => CreateUserCommand as any,
      'DeleteUser': () => DeleteUserCommand as any,
      'ListRoles': () => ListRolesCommand as any,
      'CreateRole': () => CreateRoleCommand as any,
      'DeleteRole': () => DeleteRoleCommand as any,
      'ListPolicies': () => ListPoliciesCommand as any,
      'CreatePolicy': () => CreatePolicyCommand as any
    }
  }
};

// Execution result interface
interface ExecutionResult {
  success: boolean;
  service: string;
  operation: string;
  payload: Record<string, any>;
  response?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    code?: string | number;
    requestId?: string;
  };
  duration?: number;
  timestamp: string;
  credentialType: string;
}

// Execute AWS API call
export async function executeApiCall(
  service: string, 
  operation: string, 
  payload: Record<string, any>, 
  credentialInfo: CredentialSource
): Promise<ExecutionResult> {
  try {
    // Validate service and operation
    const serviceConfig = SERVICE_CLIENTS[service];
    if (!serviceConfig) {
      throw new Error(`Unsupported service: ${service}`);
    }
    
    const commandFactory = serviceConfig.commands[operation];
    if (!commandFactory) {
      throw new Error(`Unsupported operation: ${service}.${operation}`);
    }
    
    // Get credentials configuration
    const credentialsConfig = getCredentialsConfig(credentialInfo);
    
    // Create client
    const ClientClass = serviceConfig.client;
    const client = new ClientClass(credentialsConfig);
    
    // Get command class
    const CommandClass = commandFactory();
    
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
    
  } catch (error: any) {
    return {
      success: false,
      service,
      operation,
      payload,
      error: {
        name: error.name || 'Unknown Error',
        message: error.message || 'An unknown error occurred',
        code: error.Code || error.$metadata?.httpStatusCode,
        requestId: error.$metadata?.requestId
      },
      timestamp: new Date().toISOString(),
      credentialType: credentialInfo.type
    };
  }
}

// Payload validation result
interface PayloadValidationResult {
  valid: boolean;
  payload?: Record<string, any>;
  error?: string;
}

// Validate JSON payload
export function validatePayload(payloadString: string): PayloadValidationResult {
  try {
    const payload = JSON.parse(payloadString) as Record<string, any>;
    return { valid: true, payload };
  } catch (error: any) {
    return { 
      valid: false, 
      error: `Invalid JSON: ${error.message}` 
    };
  }
}

// Format response for display
export function formatResponse(result: ExecutionResult): any {
  if (result.success && result.response) {
    return {
      ...result,
      response: JSON.stringify(result.response, null, 2)
    };
  } else if (!result.success && result.error) {
    return {
      ...result,
      error: JSON.stringify(result.error, null, 2)
    };
  }
  return result;
}

// Get supported services list
export function getSupportedServices(): string[] {
  return Object.keys(SERVICE_CLIENTS);
}

// Get supported operations for a service
export function getSupportedOperations(service: string): string[] {
  const serviceConfig = SERVICE_CLIENTS[service];
  return serviceConfig ? Object.keys(serviceConfig.commands) : [];
}

// Check if service and operation are supported
export function isOperationSupported(service: string, operation: string): boolean {
  const serviceConfig = SERVICE_CLIENTS[service];
  return !!(serviceConfig && serviceConfig.commands[operation]);
}
