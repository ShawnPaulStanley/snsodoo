import { env } from '../config/env.js';

export function getHealthStatus() {
  return {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: env.nodeEnv,
    version: 'v1',
  };
}
