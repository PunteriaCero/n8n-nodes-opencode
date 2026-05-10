/**
 * OpenCode Node Parameters and UI Description
 */

import { INodeProperties } from 'n8n-workflow';

export const properties: INodeProperties[] = [
  {
    displayName: 'Prompt',
    name: 'prompt',
    type: 'string',
    typeOptions: {
      rows: 5,
    },
    default: '',
    required: true,
    description: 'Task description or prompt for OpenCode. Supports expressions (e.g., {{$json.message}})',
    placeholder: 'What should OpenCode do? E.g., "Respond to this message in a professional manner"',
  },
  {
    displayName: 'Session Title',
    name: 'title',
    type: 'string',
    default: 'n8n task',
    description: 'Human-readable title for this OpenCode session (helps identify in logs/UI)',
    placeholder: 'E.g., "LinkedIn reply - John Doe"',
  },
  {
    displayName: 'Wait for Response',
    name: 'waitForResponse',
    type: 'boolean',
    default: true,
    description: 'Wait for OpenCode to complete or fire-and-forget',
  },
  {
    displayName: 'Max Retries',
    name: 'maxRetries',
    type: 'number',
    default: 3,
    description: 'Number of retry attempts if request fails',
    typeOptions: {
      numberPrecision: 0,
      minValue: 0,
      maxValue: 10,
    },
  },
  {
    displayName: 'Retry Delay (ms)',
    name: 'retryDelay',
    type: 'number',
    default: 2000,
    description: 'Delay between retry attempts in milliseconds',
    typeOptions: {
      numberPrecision: 0,
      minValue: 100,
      maxValue: 30000,
    },
  },
  {
    displayName: 'Continue on Error',
    name: 'continueOnError',
    type: 'boolean',
    default: false,
    description: 'Continue workflow execution even if this node fails',
  },
];
