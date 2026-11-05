import { aiConfig, ModelDescriptor } from '../../config/ai.config';
import { config } from '../../config/env';
import { OpenAICompatibleAdapter } from '../openai-compatible/openai-compatible.adapter';

export interface NvidiaAdapterOptions {
  apiKey?: string;
  baseUrl?: string;
  models?: readonly ModelDescriptor[];
  timeoutMs?: number;
  temperature?: number;
  maxOutputTokens?: number;
  fetchFn?: typeof fetch;
}

export class NvidiaAdapter extends OpenAICompatibleAdapter {
  constructor(options: NvidiaAdapterOptions = {}) {
    super({
      name: 'nvidia',
      apiKey:
        typeof options.apiKey === 'string'
          ? options.apiKey
          : config.nvidiaApiKey,
      baseUrl:
        options.baseUrl ||
        aiConfig.nvidia.baseUrl ||
        'https://integrate.api.nvidia.com/v1',
      models: options.models || aiConfig.nvidia.models,
      timeoutMs: options.timeoutMs ?? aiConfig.nvidia.timeoutMs,
      temperature: options.temperature ?? aiConfig.nvidia.temperature,
      maxOutputTokens:
        options.maxOutputTokens ?? aiConfig.nvidia.maxOutputTokens,
      fetchFn: options.fetchFn,
    });
  }
}

