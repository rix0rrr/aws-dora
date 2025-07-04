const fs = require('fs');
const path = require('path');
const os = require('os');

// Detect available AWS credentials
async function detectCredentials() {
  const credentials = [];
  
  // 1. Environment Variables
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    credentials.push({
      type: 'environment',
      name: 'Environment Variables',
      description: 'AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY',
      region: process.env.AWS_DEFAULT_REGION || process.env.AWS_REGION || 'us-east-1'
    });
  }
  
  // 2. EC2 Instance Role (check if we're running on EC2)
  try {
    // This is a simple check - in a real implementation you'd make a request to the metadata service
    // For now, we'll just add it as an option
    credentials.push({
      type: 'ec2-role',
      name: 'EC2 Instance Role',
      description: 'Use IAM role attached to EC2 instance',
      region: process.env.AWS_DEFAULT_REGION || 'us-east-1'
    });
  } catch (error) {
    // EC2 role not available
  }
  
  // 3. AWS Config/Credentials Files
  const awsDir = path.join(os.homedir(), '.aws');
  const credentialsFile = path.join(awsDir, 'credentials');
  const configFile = path.join(awsDir, 'config');
  
  try {
    if (fs.existsSync(credentialsFile)) {
      const profiles = parseCredentialsFile(credentialsFile);
      const configProfiles = fs.existsSync(configFile) ? parseConfigFile(configFile) : {};
      
      profiles.forEach(profile => {
        const config = configProfiles[profile] || {};
        credentials.push({
          type: 'profile',
          name: `Profile: ${profile}`,
          description: `AWS profile from ~/.aws/credentials`,
          profile: profile,
          region: config.region || process.env.AWS_DEFAULT_REGION || 'us-east-1'
        });
      });
    }
  } catch (error) {
    console.error('Error reading AWS credentials file:', error);
  }
  
  return credentials;
}

// Parse AWS credentials file
function parseCredentialsFile(filePath) {
  const profiles = [];
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        const profile = trimmed.slice(1, -1);
        profiles.push(profile);
      }
    }
  } catch (error) {
    console.error('Error parsing credentials file:', error);
  }
  return profiles;
}

// Parse AWS config file
function parseConfigFile(filePath) {
  const profiles = {};
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let currentProfile = null;
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        // Handle both [profile name] and [default] formats
        const match = trimmed.match(/^\[(?:profile\s+)?(.+)\]$/);
        if (match) {
          currentProfile = match[1];
          profiles[currentProfile] = {};
        }
      } else if (currentProfile && trimmed.includes('=')) {
        const [key, value] = trimmed.split('=').map(s => s.trim());
        profiles[currentProfile][key] = value;
      }
    }
  } catch (error) {
    console.error('Error parsing config file:', error);
  }
  return profiles;
}

// Get credentials configuration for AWS SDK
function getCredentialsConfig(credentialInfo) {
  switch (credentialInfo.type) {
    case 'environment':
      return {
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          sessionToken: process.env.AWS_SESSION_TOKEN
        },
        region: credentialInfo.region
      };
      
    case 'ec2-role':
      return {
        // AWS SDK will automatically use EC2 instance role
        region: credentialInfo.region
      };
      
    case 'profile':
      return {
        credentials: {
          profile: credentialInfo.profile
        },
        region: credentialInfo.region
      };
      
    default:
      throw new Error(`Unknown credential type: ${credentialInfo.type}`);
  }
}

module.exports = {
  detectCredentials,
  getCredentialsConfig
};
