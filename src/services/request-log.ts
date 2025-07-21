import { CredentialSource } from '../types';

export interface LogEntry {
  timestamp: Date;
  service: string;
  operation: string;
  request: string;
  response: string;
  credentials: CredentialSource;
  region: string;
}

export class RequestLog {
  public readonly logs: LogEntry[] = [];

  public add(entry: LogEntry): void {
    this.logs.push(entry);
  }

  clear() {
    this.logs.splice(0, this.logs.length);
  }
}