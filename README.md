# trvl - Travel Planning App

A modern travel planning application built with React, TypeScript, and Vite with MySQL backend.

## Features

- AI-powered activity suggestions (Groq AI)
- Real places search (Foursquare API)
- Currency conversion with INR display
- Dark mode support
- Drag & drop itinerary planning

## Setup

### Prerequisites
- Node.js 18+
- MySQL 8.0+ (or a hosted MySQL like PlanetScale, Railway, etc.)

### Install dependencies:
```bash
npm install
```

### Configure environment variables:
Copy `.env.example` to `.env` and fill in your API keys:
```bash
cp .env.example .env
```

Required keys:
- `VITE_GROQ_API_KEY` - Get from [Groq Console](https://console.groq.com)
- `VITE_FOURSQUARE_API_KEY` - Get from [Foursquare Developer](https://developer.foursquare.com)
- `VITE_CURRENCY_API_KEY` - Get from [FreeCurrencyAPI](https://freecurrencyapi.com)

For backend (MySQL):
- `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`

### Run the development server:
```bash
npm run dev
```

### Build for production:
```bash
npm run build
```

## Vercel Deployment

1. Push your code to GitHub
2. Connect your repo to Vercel
3. Add environment variables in Vercel project settings:
   - All `VITE_*` keys for frontend
   - All `MYSQL_*` keys for backend API
4. Deploy!

For MySQL, you can use:
- [PlanetScale](https://planetscale.com) (serverless MySQL)
- [Railway](https://railway.app)
- [Supabase](https://supabase.com) (PostgreSQL alternative)

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS with dark mode
- MySQL + Vercel Serverless Functions
- Groq AI (LLaMA 3.1)
- Foursquare Places API
- FreeCurrency API
