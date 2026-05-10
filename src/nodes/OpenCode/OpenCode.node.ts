/**
 * OpenCode Node - Main Implementation
 * Handles session creation, prompt sending, and response parsing
 */

import {
  IExecuteFunctions,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
  INodeExecutionData,
} from 'n8n-workflow';

import { properties } from './OpenCodeDescription';
import { IOpenCodeCredentials, IOpenCodeNodeResponse, IOpenCodeNodeParams } from '../../types';

export class OpenCode implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'OpenCode',
    name: 'openCode',
    icon: 'file:opencode.svg',
    group: ['transform'],
    version: 1,
    description: 'Execute tasks in OpenCode',
    defaults: {
      name: 'OpenCode',
      color: '#3366ff',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'openCodeApi',
        required: true,
      },
    ],
    properties,
  };

  async execute(this: IExecuteFunctions) {
    const items = this.getInputData();
    const credentials = (await this.getCredentials('openCodeApi')) as IOpenCodeCredentials;

    if (!credentials) {
      throw new NodeOperationError(this.getNode(), 'OpenCode credentials not configured');
    }

    const baseUrl = credentials.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    const globalTimeout = credentials.sessionTimeout * 1000; // Convert to ms

    const results: INodeExecutionData[] = [];
    const openCode = new OpenCode();

    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      try {
        const prompt = this.getNodeParameter('prompt', itemIndex) as string;
        const title = this.getNodeParameter('title', itemIndex, 'n8n task') as string;
        const waitForResponse = this.getNodeParameter('waitForResponse', itemIndex, true) as boolean;
        const maxRetries = this.getNodeParameter('maxRetries', itemIndex, 3) as number;
        const retryDelay = this.getNodeParameter('retryDelay', itemIndex, 2000) as number;
        const continueOnError = this.getNodeParameter('continueOnError', itemIndex, false) as boolean;

        // Validate prompt is not empty
        if (!prompt || prompt.trim().length === 0) {
          throw new Error('Prompt cannot be empty');
        }

        const params: IOpenCodeNodeParams = {
          prompt,
          title,
          waitForResponse,
          maxRetries,
          retryDelay,
          continueOnError,
        };

        const response = await openCode.executeOpenCodeTask(baseUrl, globalTimeout, params);
        results.push({ json: response as any });
      } catch (error) {
        const continueOnError = this.getNodeParameter('continueOnError', itemIndex, false) as boolean;

        if (continueOnError) {
          results.push({
            json: {
              success: false,
              error: (error as Error).message,
              sessionId: '',
              retryCount: 0,
            } as any,
          });
        } else {
          throw new NodeOperationError(
            this.getNode(),
            `Error executing OpenCode task: ${(error as Error).message}`,
          );
        }
      }
    }

    return [results];
  }

  async executeOpenCodeTask(
    baseUrl: string,
    timeout: number,
    params: IOpenCodeNodeParams,
  ): Promise<IOpenCodeNodeResponse> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= params.maxRetries; attempt++) {
      try {
        // Create session
        const sessionResponse = await this.createSession(baseUrl, params.title);
        const sessionId = sessionResponse.id;

        // Send prompt
        if (params.waitForResponse) {
          const messageResponse = await this.sendMessage(baseUrl, sessionId, params.prompt, timeout);
          return {
            success: true,
            sessionId,
            response: messageResponse,
          };
        } else {
          // Fire and forget
          await this.sendMessage(baseUrl, sessionId, params.prompt, 5000); // Short timeout for fire-and-forget
          return {
            success: true,
            sessionId,
          };
        }
      } catch (error) {
        lastError = error as Error;

        if (attempt < params.maxRetries) {
          // Wait before retrying
          await this.sleep(params.retryDelay);
        }
      }
    }

    // All retries exhausted
    return {
      success: false,
      error: lastError?.message || 'Unknown error',
      sessionId: '',
      retryCount: params.maxRetries,
    };
  }

  private async createSession(baseUrl: string, title: string): Promise<{ id: string; created_at: string }> {
    const response = await fetch(`${baseUrl}/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create session: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as { id: string; created_at: string };
    return data;
  }

  private async sendMessage(
    baseUrl: string,
    sessionId: string,
    prompt: string,
    timeout: number,
  ): Promise<{ content: string; tokens_used: number; execution_time: number }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${baseUrl}/session/${sessionId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parts: [
            {
              type: 'text',
              text: prompt,
            },
          ],
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as { content: string; tokens_used: number; execution_time: number };
      return data;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
