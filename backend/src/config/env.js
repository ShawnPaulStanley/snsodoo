import dotenv from 'dotenv';

// Load environment variables early so other modules can rely on them
dotenv.config();

const env = {
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  llmProvider: process.env.LLM_PROVIDER || 'none',
  llmApiKey: process.env.LLM_API_KEY || '',
};

export { env };
