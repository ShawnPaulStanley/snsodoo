import http from 'http';
import app from './app.js';
import { env } from './config/env.js';

const port = env.port;

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`API server running on port ${port} (env: ${env.nodeEnv})`);
});

// Fail fast on unhandled errors but keep logs minimal
attachProcessHandlers();

function attachProcessHandlers() {
  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled promise rejection', reason);
  });
  process.on('uncaughtException', (err) => {
    console.error('Uncaught exception', err);
    process.exit(1);
  });
}
