import { aiConfig, ModelDescriptor } from '../../config/ai.config';
import { config } from '../../config/env';
import {
  OpenAICompatibleAdapter,
  OpenAICompatibleAdapterOptions,
} from '../openai-compatible/openai-compatible.adapter';

export interface GroqAdapterOptions {
  apiKey?: string;
  baseUrl?: string;
  models?: readonly ModelDescriptor[];
  timeoutMs?: number;
  temperature?: number;
  maxOutputTokens?: number;
  fetchFn?: typeof fetch;
}

export class GroqAdapter extends OpenAICompatibleAdapter {
  constructor(options: GroqAdapterOptions = {}) {
    super({
      name: 'groq',
      apiKey:
        typeof options.apiKey === 'string' ? options.apiKey : config.groqApiKey,
      baseUrl: options.baseUrl || aiConfig.groq.baseUrl || 'https://api.groq.com/openai/v1',
      models: options.models || aiConfig.groq.models,
      timeoutMs: options.timeoutMs ?? aiConfig.groq.timeoutMs,
      temperature: options.temperature ?? aiConfig.groq.temperature,
      maxOutputTokens: options.maxOutputTokens ?? aiConfig.groq.maxOutputTokens,
      fetchFn: options.fetchFn,
    });
  }
}

