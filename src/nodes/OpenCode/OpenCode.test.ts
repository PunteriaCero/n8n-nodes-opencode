/**
 * Unit tests for OpenCode Node
 */

import { OpenCode } from './OpenCode.node';
import { properties } from './OpenCodeDescription';

describe('OpenCode Node', () => {
  describe('Properties', () => {
    test('should have prompt as required property', () => {
      const promptProp = properties.find((p) => p.name === 'prompt');
      expect(promptProp).toBeDefined();
      expect(promptProp?.required).toBe(true);
    });

    test('should have default values for optional properties', () => {
      const titleProp = properties.find((p) => p.name === 'title');
      const waitProp = properties.find((p) => p.name === 'waitForResponse');
      const retriesProp = properties.find((p) => p.name === 'maxRetries');

      expect(titleProp?.default).toBe('n8n task');
      expect(waitProp?.default).toBe(true);
      expect(retriesProp?.default).toBe(3);
    });
  });

  describe('Node Metadata', () => {
    const node = new OpenCode();

    test('should have correct display name', () => {
      expect(node.description.displayName).toBe('OpenCode');
    });

    test('should require openCodeApi credentials', () => {
      const credentials = node.description.credentials;
      expect(credentials).toBeDefined();
      expect(credentials?.[0].name).toBe('openCodeApi');
      expect(credentials?.[0].required).toBe(true);
    });

    test('should have main input and output', () => {
      expect(node.description.inputs).toContain('main');
      expect(node.description.outputs).toContain('main');
    });
  });

  describe('Validation', () => {
    test('prompt property should have row options for textarea', () => {
      const promptProp = properties.find((p) => p.name === 'prompt');
      expect(promptProp?.typeOptions).toHaveProperty('rows', 5);
    });

    test('retry delay should have min/max constraints', () => {
      const retryDelayProp = properties.find((p) => p.name === 'retryDelay');
      expect(retryDelayProp?.typeOptions?.minValue).toBe(100);
      expect(retryDelayProp?.typeOptions?.maxValue).toBe(30000);
    });

    test('max retries should have min/max constraints', () => {
      const maxRetriesProp = properties.find((p) => p.name === 'maxRetries');
      expect(maxRetriesProp?.typeOptions?.minValue).toBe(0);
      expect(maxRetriesProp?.typeOptions?.maxValue).toBe(10);
    });
  });
});
