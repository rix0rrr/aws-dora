import fs from 'fs';
import path from 'path';
import os from 'os';
import { CredentialSource, AWSCredentials, AWSProfile, ServiceClientConfig } from '../types';

// Detect available AWS credentials
export async function detectCredentialSources(): Promise<CredentialSource[]> {
  const credentials: CredentialSource[] = [];

  // 1. Environment Variables
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    credentials.push({
      type: 'environment',
      name: 'Environment Variables',
      region: process.env.AWS_DEFAULT_REGION ?? process.env.AWS_REGION,
    });
  }

  // 2. EC2 Instance Role (check if we're running on EC2)
  try {
    // This is a simple check - in a real implementation you'd make a request to the metadata service
    // For now, we'll just add it as an option
    credentials.push({
      type: 'ec2-instance',
      name: 'EC2 Instance Role',
      region: process.env.AWS_DEFAULT_REGION ?? 'us-east-1',
    });
  } catch (error) {
    // EC2 role not available
  }

  // 3. AWS Config/Credentials Files
  const awsDir: string = path.join(os.homedir(), '.aws');
  const credentialsFile: string = path.join(awsDir, 'credentials');
  const configFile: string = path.join(awsDir, 'config');

  try {
    if (fs.existsSync(credentialsFile)) {
      const profiles: string[] = parseCredentialsFile(credentialsFile);
      const configProfiles: Record<string, Record<string, string>> = fs.existsSync(configFile)
        ? parseConfigFile(configFile)
        : {};

      profiles.forEach(profileName => {
        const config = configProfiles[profileName] || {};
        const profile: AWSProfile = {
          name: profileName,
          region: config.region || process.env.AWS_DEFAULT_REGION || 'us-east-1'
        };

        credentials.push({
          type: 'profile',
          name: `Profile: ${profileName}`,
          region: profile.region,
          profile
        });
      });
    }
  } catch (error) {
    console.error('Error reading AWS credentials file:', error);
  }

  return credentials;
}

// Parse AWS credentials file
function parseCredentialsFile(filePath: string): string[] {
  const profiles: string[] = [];
  try {
    const content: string = fs.readFileSync(filePath, 'utf8');
    const lines: string[] = content.split('\n');

    for (const line of lines) {
      const trimmed: string = line.trim();
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        const profile: string = trimmed.slice(1, -1);
        profiles.push(profile);
      }
    }
  } catch (error) {
    console.error('Error parsing credentials file:', error);
  }
  return profiles;
}

// Parse AWS config file
function parseConfigFile(filePath: string): Record<string, Record<string, string>> {
  const profiles: Record<string, Record<string, string>> = {};
  try {
    const content: string = fs.readFileSync(filePath, 'utf8');
    const lines: string[] = content.split('\n');
    let currentProfile: string | null = null;

    for (const line of lines) {
      const trimmed: string = line.trim();
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        // Handle both [profile name] and [default] formats
        const match = trimmed.match(/^\[(?:profile\s+)?(.+)\]$/);
        if (match && match[1]) {
          currentProfile = match[1];
          profiles[currentProfile] = {};
        }
      } else if (currentProfile && trimmed.includes('=')) {
        const parts: string[] = trimmed.split('=');
        if (parts.length >= 2) {
          const key: string = parts[0]?.trim() || '';
          const value: string = parts.slice(1).join('=').trim();
          if (key && profiles[currentProfile]) {
            profiles[currentProfile][key] = value;
          }
        }
      }
    }
  } catch (error) {
    console.error('Error parsing config file:', error);
  }
  return profiles;
}

// Get credentials configuration for AWS SDK
export function getCredentialsConfig(credentialInfo: CredentialSource): ServiceClientConfig {
  const region: string = credentialInfo.region || 'us-east-1';

  switch (credentialInfo.type) {
    case 'environment': {
      const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
      const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

      if (!accessKeyId || !secretAccessKey) {
        throw new Error('Environment credentials not found');
      }

      const credentials: AWSCredentials = {
        accessKeyId,
        secretAccessKey,
        sessionToken: process.env.AWS_SESSION_TOKEN,
        region
      };

      return { credentials, region };
    }

    case 'ec2-instance':
      return {
        // AWS SDK will automatically use EC2 instance role
        credentials: {} as AWSCredentials, // Will be populated by SDK
        region
      };

    case 'profile': {
      if (!credentialInfo.profile) {
        throw new Error('Profile information not found');
      }

      // For profile-based credentials, we'll let the AWS SDK handle the profile loading
      const credentials: AWSCredentials = {
        accessKeyId: '', // Will be loaded by SDK
        secretAccessKey: '', // Will be loaded by SDK
        region
      };

      return { credentials, region };
    }

    default:
      throw new Error(`Unknown credential type: ${(credentialInfo as CredentialSource).type}`);
  }
}

// Validate credentials format
export function validateCredentials(credentials: CredentialSource): boolean {
  if (!credentials.type || !credentials.name) {
    return false;
  }

  switch (credentials.type) {
    case 'environment':
      return !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);

    case 'ec2-instance':
      return true; // We assume EC2 instance role is available if selected

    case 'profile':
      return !!(credentials.profile && credentials.profile.name);

    default:
      return false;
  }
}

// Get display name for credentials
export function getCredentialsDisplayName(credentials: CredentialSource): string {
  switch (credentials.type) {
    case 'environment':
      return 'Environment Variables';

    case 'ec2-instance':
      return 'EC2 Instance Role';

    case 'profile':
      return `Profile: ${credentials.profile?.name || 'Unknown'}`;

    default:
      return 'Unknown Credentials';
  }
}
