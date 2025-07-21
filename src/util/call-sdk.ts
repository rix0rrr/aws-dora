import { fromContainerMetadata, fromEnv, fromIni, fromInstanceMetadata } from '@aws-sdk/credential-providers';
import { NodeHttpHandler } from '@smithy/node-http-handler';
import { ProxyAgent } from 'proxy-agent';
import { CredentialSource } from '../types';

const AGENT = new ProxyAgent();

export async function callSdk(
  serviceName: string,
  className: string,
  operationName: string,
  payload: Record<string, unknown>,
  credentials: CredentialSource,
  region: string,
): Promise<CallSdkResponse> {
  const start = Date.now();

  // Import the SDK client dynamically based on the service name
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const allSdks = require('aws-sdk-js-v3-all');
  const module = allSdks[serviceName];
  if (!module) {
    throw new Error(`Service ${serviceName} not found in AWS SDK v3`);
  }

  const clientName = `${className}Client`;
  const ctr = module[clientName];
  if (!ctr) {
    throw new Error(`Constructor ${clientName} not found in module ${serviceName}`);
  }

  const commandName = `${operationName}Command`;
  const command = module[commandName];
  if (!command) {
    throw new Error(`Command ${commandName} not found in module ${serviceName}`);
  }

  const client = new ctr({
    /*
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken,
    },
    */
    credentials: credentialProviderFromSource(credentials),
    region,
    requestHandler: new NodeHttpHandler({
      httpAgent: AGENT,
      httpsAgent: AGENT,
    }),
  });

  // Call the operation and return the result
  const response = await client.send(new command(payload));

  return {
    response,
    duration: Date.now() - start,
  };
}

export interface CallSdkResponse {
  response: Record<string, unknown> & {
    $metadata?: {
      attempts: number;
      httpStatusCode: number;
      requestId: string;
      extendedRequestId?: string;
      totalRetryDelay: number;
    };
  };
  duration: number;
}

function credentialProviderFromSource(credentials: CredentialSource) {
  switch (credentials.type) {
    case 'environment':
      return fromEnv();
    case 'profile':
      return fromIni({
        profile: credentials.profileName,
      });
    case 'ec2-instance':
      return fromInstanceMetadata();
    case 'container':
      return fromContainerMetadata();
  }
}