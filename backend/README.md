# Backend (Express API)

Minimal, modular Express API scaffolded for hackathon speed. Frontend is decoupled and untouched.

## Quick start

```bash
cd backend
npm install
npm run dev
```

The server defaults to port `4000` (set `PORT` to override). All routes are prefixed with `/api/v1`.

## Available endpoints

- `GET /api/v1/health` — basic uptime/status probe.

## Environment

Copy `.env.example` to `.env` and adjust:

- `PORT` — HTTP port
- `NODE_ENV` — `development` | `production`
- `LLM_PROVIDER` — `openai`, `gemini`, `local`, or `none`
- `LLM_API_KEY` — leave blank for now; no keys are hardcoded

## LLM integration

`src/services/llm/llm.service.js` exposes `queryLLM(prompt, context)` as the single integration point. Swap implementations later without touching controllers/routes.

## Notes

- Uses `nodemon` for local dev (`npm run dev`).
- Centralized error handling returns JSON and keeps logs minimal.
- New routes go under `src/routes`, controllers under `src/controllers`, and business/LLM logic under `src/services`.
