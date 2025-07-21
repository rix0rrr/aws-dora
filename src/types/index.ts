// Credential Types
export interface AWSCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
  region?: string;
}

export interface AWSProfile {
  name: string;
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  sessionToken?: string;
  roleArn?: string;
  sourceProfile?: string;
}

export type CredentialSource = {
  name: string;
  defaultRegion?: string;
} & (
  | { type: 'environment' }
  | { type: 'profile'; profileName: string }
  | { type: 'ec2-instance' }
  | { type: 'container' }
);

// Template Types
export interface FieldDefinition {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description?: string;
  example?: any;
  properties?: Record<string, FieldDefinition>;
  items?: FieldDefinition;
}

export interface RequestTemplate {
  service: string;
  operation: string;
  template: Record<string, any>;
  fields: Record<string, FieldDefinition>;
}

export interface ApiRequestFormProps {
  template?: RequestTemplate;
  credentials: CredentialSource[];
  selectedCredentials?: CredentialSource;
}

// Service Configuration Types
export interface ServiceClientConfig {
  region: string;
  credentials: AWSCredentials;
}

export interface ExecutionContext {
  service: string;
  operation: string;
  credentials: CredentialSource;
  region: string;
}

// Error Types
export interface APIError extends Error {
  statusCode?: number;
  code?: string;
  requestId?: string;
}

// Filter/Search Types
export interface FilterState {
  query: string;
  category?: string;
  service?: string;
}

// Configuration Types
export interface AppConfig {
  port: number;
  defaultRegion: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
