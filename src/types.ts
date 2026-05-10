/**
 * TypeScript interfaces for OpenCode API
 */

export interface IOpenCodeCredentials {
  baseUrl: string;
  sessionTimeout: number;
}

export interface ISessionRequest {
  title: string;
}

export interface ISessionResponse {
  id: string;
  created_at: string;
}

export interface IMessagePart {
  type: 'text' | 'image' | 'code';
  text?: string;
  url?: string;
}

export interface IMessageRequest {
  parts: IMessagePart[];
}

export interface IMessageResponse {
  content: string;
  tokens_used: number;
  execution_time: number;
}

export interface IOpenCodeNodeResponse {
  success: boolean;
  sessionId: string;
  response?: IMessageResponse;
  error?: string;
  retryCount?: number;
}

export interface IOpenCodeNodeParams {
  prompt: string;
  title: string;
  waitForResponse: boolean;
  maxRetries: number;
  retryDelay: number;
  continueOnError: boolean;
}
