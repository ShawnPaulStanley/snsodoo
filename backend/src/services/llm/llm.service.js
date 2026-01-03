import { env } from '../../config/env.js';

// Placeholder LLM service. Routes/controllers should only talk to the LLM through here.
export async function queryLLM(prompt, context = {}) {
  // In a real integration, dispatch to OpenAI/Gemini/local model based on env.llmProvider
  return {
    provider: env.llmProvider,
    ok: false,
    message: 'LLM integration not configured yet',
    promptEcho: prompt,
    context,
  };
}
