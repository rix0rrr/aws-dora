import { Request, Response } from 'express';

// AWS Service Types
export interface AWSService {
  name: string;
  operations: string[];
}

export interface AWSServiceCategory {
  [serviceName: string]: AWSService;
}

export interface AWSServices {
  [category: string]: AWSServiceCategory;
}

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

export interface CredentialSource {
  type: 'environment' | 'profile' | 'ec2-instance';
  name: string;
  region?: string;
  profile?: AWSProfile;
}

// Request/Response Types
export interface APIRequest {
  service: string;
  operation: string;
  payload: Record<string, any>;
  credentials: CredentialSource;
  region: string;
}

export interface APIResponse {
  success: boolean;
  data?: Record<string, any>;
  error?: string;
  statusCode?: number;
  requestId?: string;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  service: string;
  operation: string;
  request: APIRequest;
  response: APIResponse;
  duration: number;
}

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

// Express Types
export interface TypedRequest<T = Record<string, any>> extends Request {
  body: T;
}

// Component Props Types
export interface LayoutProps {
  children?: React.ReactNode;
  title?: string;
}

export interface ServicesTreeProps {
  services: AWSServices;
  selectedService?: string;
  selectedOperation?: string;
}

export interface ApiRequestFormProps {
  template?: RequestTemplate;
  credentials: CredentialSource[];
  selectedCredentials?: CredentialSource;
}

export interface CredentialsSelectorProps {
  credentials: CredentialSource[];
  selected?: CredentialSource;
}

export interface RequestLoggerProps {
  logs: LogEntry[];
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
