/**
 * OpenCode API Credentials Type
 * Defines how OpenCode credentials are configured in n8n
 */

import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class OpenCodeApi implements ICredentialType {
  name = 'openCodeApi';
  displayName = 'OpenCode API';
  documentationUrl = 'https://opencode.ai/docs';

  properties: INodeProperties[] = [
    {
      displayName: 'Base URL',
      name: 'baseUrl',
      type: 'string',
      default: 'http://localhost:4096',
      placeholder: 'http://192.168.0.214:4096',
      description: 'Base URL of your OpenCode instance',
      required: true,
      typeOptions: {
        alwaysOpenEditWindow: false,
      },
    },
    {
      displayName: 'Session Timeout (seconds)',
      name: 'sessionTimeout',
      type: 'number',
      default: 180,
      description: 'Maximum time to wait for OpenCode response (3-600 seconds)',
      required: false,
      typeOptions: {
        numberPrecision: 0,
        minValue: 3,
        maxValue: 600,
      },
    },
  ];
}
