/**
 * Entry point for n8n to load nodes and credentials
 */

import { INodeType, ICredentialType } from 'n8n-workflow';

import { OpenCode } from './nodes/OpenCode/OpenCode.node';
import { OpenCodeApi } from './credentials/OpenCodeApi.credentials';

export const nodes: Array<typeof OpenCode> = [OpenCode];

export const credentials: Array<typeof OpenCodeApi> = [OpenCodeApi];
