export interface ModelDescriptor {
  readonly id: string;
  readonly label: string;
}

export interface ClusterConfig {
  readonly models: readonly ModelDescriptor[];
  readonly timeoutMs: number;
  readonly maxOutputTokens: number;
  readonly temperature: number;
  readonly baseUrl?: string;
}

export interface HexaClusterConfig {
  readonly gemini: ClusterConfig;
  readonly groq: ClusterConfig;
  readonly sambanova: ClusterConfig;
  readonly nvidia: ClusterConfig;
  readonly cohere: ClusterConfig;
  readonly openrouter: ClusterConfig;
  readonly totalTimeoutMs: number;
}

export const aiConfig: HexaClusterConfig = {
  gemini: {
    models: [
      { id: 'gemini-4-argon', label: 'Gemini 4 Argon' },
      { id: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash' },
      { id: 'gemini-3.6-flash', label: 'Gemini 3.6 Flash' },
      { id: 'gemini-3.5-flash-lite', label: 'Gemini 3.5 Flash Lite' },
      { id: 'gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro' },
      { id: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash Lite' },
      { id: 'gemini-3-flash-preview', label: 'Gemini 3 Flash' },
      { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
      { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
      { id: 'gemini-flash-latest', label: 'Gemini 2 Flash' },
      { id: 'gemini-2.5-flash-lite', label: 'Gemini 2 Flash Lite' },
      { id: 'gemma-4-31b-it', label: 'Gemma 4 31B' },
      { id: 'gemma-4-26b-a4b-it', label: 'Gemma 4 26B' },
      { id: 'gemini-2.5-computer-use-preview-10-2025', label: 'Computer Use Preview' },
      { id: 'gemini-robotics-er-2-preview', label: 'Gemini Robotics ER 2 Preview' },
    ],
    timeoutMs: 15000,
    maxOutputTokens: 2048,
    temperature: 0.2,
  },
  groq: {
    models: [
      { id: 'openai/gpt-oss-120b', label: 'GPT OSS 120B' },
      { id: 'openai/gpt-oss-20b', label: 'GPT OSS 20B' },
      { id: 'qwen/qwen3.8-27b', label: 'Qwen 3.8 27B' },
      { id: 'allam-2-7b', label: 'ALLaM 2 7B' },
    ],
    baseUrl: 'https://api.groq.com/openai/v1',
    timeoutMs: 15000,
    maxOutputTokens: 2048,
    temperature: 0.2,
  },
  sambanova: {
    models: [
      { id: 'gpt-oss-120b', label: 'SambaNova GPT OSS 120B' },
      { id: 'Meta-Llama-3.3-70B-Instruct', label: 'Llama 3.3 70B' },
      { id: 'MiniMax-M3.1-Flash', label: 'MiniMax M3.1 Flash' },
      { id: 'gemma-4-31B-it', label: 'Gemma 4 31B' },
    ],
    baseUrl: 'https://api.sambanova.ai/v1',
    timeoutMs: 15000,
    maxOutputTokens: 2048,
    temperature: 0.2,
  },
  nvidia: {
    models: [
      { id: 'nvidia/nemotron-3-ultra-550b-a55b', label: 'Nemotron 3 Ultra 550B' },
      { id: 'nvidia/nemotron-3.5-super-vl-120b-a12b', label: 'Nemotron 3.5 Super VL 120B' },
      { id: 'nvidia/nemotron-3.5-lightning-30b-a3b', label: 'Nemotron 3.5 Lightning 30B' },
      { id: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning', label: 'Nemotron 3 Nano Omni' },
      { id: 'nvidia/nemotron-3.5-bolt-e4b', label: 'Nemotron 3.5 Bolt' },
    ],
    baseUrl: 'https://integrate.api.nvidia.com/v1',
    timeoutMs: 15000,
    maxOutputTokens: 2048,
    temperature: 0.2,
  },
  cohere: {
    models: [
      { id: 'command-a-plus-05-2026', label: 'Command A+ (05-2026)' },
      { id: 'command-a-reasoning-08-2025', label: 'Command A Reasoning' },
      { id: 'command-a-03-2025', label: 'Command A (03-2025)' },
      { id: 'command-r-plus-08-2024', label: 'Command R+' },
      { id: 'c4ai-aya-expanse-32b', label: 'Aya Expanse 32B' },
      { id: 'command-r-08-2024', label: 'Command R' },
      { id: 'command-r7b-12-2024', label: 'Command R 7B' },
    ],
    baseUrl: 'https://api.cohere.com/v2',
    timeoutMs: 15000,
    maxOutputTokens: 2048,
    temperature: 0.2,
  },
  openrouter: {
    models: [
      { id: 'nvidia/nemotron-3-ultra-550b-a55b:free', label: 'Nemotron 3 Ultra (Free)' },
      { id: 'nvidia/nemotron-3.5-super-vl:free', label: 'Nemotron 3.5 Super VL (Free)' },
      { id: 'nvidia/nemotron-3.5-lightning:free', label: 'Nemotron 3.5 Lightning (Free)' },
      { id: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free', label: 'Nemotron Nano Omni (Free)' },
      { id: 'cohere/north-mini-code:free', label: 'North Mini Code (Free)' },
      { id: 'google/gemma-4-31b-it:free', label: 'Gemma 4 31B (Free)' },
      { id: 'google/gemma-4-26b-a4b-it:free', label: 'Gemma 4 26B (Free)' },
      { id: 'xingchen-agi/xing4.0-29b-a4b:free', label: 'Xing4.0 29B (Free)' },
      { id: 'recursive/flint-v1.0:free', label: 'Flint (Free)' },
      { id: 'stealth/crouton-alpha', label: 'Crouton Alpha' },
      { id: 'openrouter/free', label: 'OpenRouter Free Auto-Router' },
      { id: 'liquid/lfm-2.5-2.6b:free', label: 'Liquid LFM 2.6B (Free)' },
      { id: 'dots-studio/dots-3-note-preview:free', label: 'Dots3 Note Preview (Free)' },
    ],
    baseUrl: 'https://openrouter.ai/api/v1',
    timeoutMs: 15000,
    maxOutputTokens: 2048,
    temperature: 0.2,
  },
  totalTimeoutMs: 45000,
};
