import { CredentialSource } from '../types';
import { loadSharedConfigFiles } from '@aws-sdk/shared-ini-file-loader';
import { MetadataService } from '@aws-sdk/ec2-metadata-service';

export const ALL_REGIONS = [
  'af-south-1',
  'ap-east-1',
  'ap-east-2',
  'ap-northeast-1',
  'ap-northeast-2',
  'ap-northeast-3',
  'ap-south-1',
  'ap-south-2',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-southeast-3',
  'ap-southeast-4',
  'ap-southeast-5',
  'ap-southeast-7',
  'ca-central-1',
  'ca-west-1',
  'cn-north-1',
  'cn-northwest-1',
  'eu-central-1',
  'eu-central-2',
  'eu-north-1',
  'eu-south-1',
  'eu-south-2',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'il-central-1',
  'me-central-1',
  'me-south-1',
  'mx-central-1',
  'sa-east-1',
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
];

export interface CredentialViewModel {
  credentials: CredentialSource[];
  selectedCredential?: CredentialSource;
  selectedRegion?: string;
}

// Detect available AWS credentials
export async function detectCredentialSources(): Promise<CredentialSource[]> {
  const credentials: CredentialSource[] = [];

  const configFiles = await loadSharedConfigFiles();
  const defaultIniRegion = configFiles.configFile?.default?.region;
  const defaultEc2Region = await regionFromMetadataService();

  // 1. Environment Variables
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    credentials.push({
      type: 'environment',
      name: 'Environment Variables',
      defaultRegion: process.env.AWS_DEFAULT_REGION ?? process.env.AWS_REGION ?? defaultIniRegion ?? defaultEc2Region,
    });
  }

  // 2. AWS Config/Credentials Files
  const profileNames = Array.from(new Set([
    ...Object.keys(configFiles.configFile),
    ...Object.keys(configFiles.credentialsFile)
  ])).sort();

  for (const profileName of profileNames) {
    credentials.push({
      type: 'profile',
      name: profileName === 'default' ? 'Default Profile' : `Profile [${profileName}]`,
      profileName,
      defaultRegion: configFiles.configFile?.[profileName]?.region ?? defaultIniRegion ?? defaultEc2Region,
    });
  }

  if (defaultEc2Region) {
    // 3. EC2 Instance Metadata
    credentials.push({
      type: 'ec2-instance',
      name: 'EC2 Instance Metadata',
      defaultRegion: defaultEc2Region,
    });
  }

  if (process.env.ECS_CONTAINER_METADATA_FILE) {
    credentials.push({
      type: 'container',
      name: 'ECS Container Metadata',
      defaultRegion: process.env.AWS_DEFAULT_REGION ?? process.env.AWS_REGION ?? defaultIniRegion ?? defaultEc2Region,
    });
  }

  return credentials;
}

async function regionFromMetadataService(): Promise<string | undefined> {
  try {
    const metadataService = new MetadataService({
      httpOptions: {
        timeout: 100,
      },
    });

    await metadataService.fetchMetadataToken();
    const document = await metadataService.request('/latest/dynamic/instance-identity/document', {});
    return JSON.parse(document).region;
  } catch (e) {
    return undefined;
  }
}