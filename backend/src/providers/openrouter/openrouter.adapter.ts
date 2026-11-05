import { aiConfig, ModelDescriptor } from '../../config/ai.config';
import { config } from '../../config/env';
import { OpenAICompatibleAdapter } from '../openai-compatible/openai-compatible.adapter';

export interface OpenRouterAdapterOptions {
  apiKey?: string;
  baseUrl?: string;
  models?: readonly ModelDescriptor[];
  timeoutMs?: number;
  temperature?: number;
  maxOutputTokens?: number;
  fetchFn?: typeof fetch;
}

export class OpenRouterAdapter extends OpenAICompatibleAdapter {
  constructor(options: OpenRouterAdapterOptions = {}) {
    super({
      name: 'openrouter',
      apiKey:
        typeof options.apiKey === 'string'
          ? options.apiKey
          : config.openrouterApiKey,
      baseUrl:
        options.baseUrl ||
        aiConfig.openrouter.baseUrl ||
        'https://openrouter.ai/api/v1',
      models: options.models || aiConfig.openrouter.models,
      timeoutMs: options.timeoutMs ?? aiConfig.openrouter.timeoutMs,
      temperature: options.temperature ?? aiConfig.openrouter.temperature,
      maxOutputTokens:
        options.maxOutputTokens ?? aiConfig.openrouter.maxOutputTokens,
      extraHeaders: {
        'HTTP-Referer': 'https://github.com/useripx/scratch_ardena',
        'X-Title': 'Ardena Playground',
      },
      fetchFn: options.fetchFn,
    });
  }
}

