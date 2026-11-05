import { aiConfig, ModelDescriptor } from '../../config/ai.config';
import { config } from '../../config/env';
import { OpenAICompatibleAdapter } from '../openai-compatible/openai-compatible.adapter';

export interface SambaNovaAdapterOptions {
  apiKey?: string;
  baseUrl?: string;
  models?: readonly ModelDescriptor[];
  timeoutMs?: number;
  temperature?: number;
  maxOutputTokens?: number;
  fetchFn?: typeof fetch;
}

export class SambaNovaAdapter extends OpenAICompatibleAdapter {
  constructor(options: SambaNovaAdapterOptions = {}) {
    super({
      name: 'sambanova',
      apiKey:
        typeof options.apiKey === 'string'
          ? options.apiKey
          : config.sambanovaApiKey,
      baseUrl:
        options.baseUrl ||
        aiConfig.sambanova.baseUrl ||
        'https://api.sambanova.ai/v1',
      models: options.models || aiConfig.sambanova.models,
      timeoutMs: options.timeoutMs ?? aiConfig.sambanova.timeoutMs,
      temperature: options.temperature ?? aiConfig.sambanova.temperature,
      maxOutputTokens:
        options.maxOutputTokens ?? aiConfig.sambanova.maxOutputTokens,
      fetchFn: options.fetchFn,
    });
  }
}

