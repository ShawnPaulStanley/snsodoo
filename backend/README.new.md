# Travel Planner Backend API v2.0

A clean, modular Node.js + Express.js backend for generating smart travel itineraries using AI and external APIs.

## 🏗️ Architecture

```
backend/
├── src/
│   ├── app.new.js           # Express app configuration
│   ├── server.new.js        # Server entry point
│   │
│   ├── config/
│   │   ├── env.js           # Environment variables
│   │   ├── apiKeys.js       # API key configuration
│   │   └── themeConfig.js   # Theme & sub-theme logic
│   │
│   ├── routes/
│   │   ├── index.new.js     # Route aggregator
│   │   ├── trip.routes.js   # Trip API routes
│   │   └── health.new.routes.js # Health check routes
│   │
│   ├── controllers/
│   │   └── trip.controller.js # Trip request handlers
│   │
│   ├── services/
│   │   ├── grok.new.service.js     # Grok LLM integration
│   │   ├── maps.service.js          # OpenStreetMap integration
│   │   ├── amadeus.new.service.js   # Amadeus flights/hotels
│   │   ├── weather.new.service.js   # OpenWeatherMap integration
│   │   ├── exchange.new.service.js  # Currency conversion
│   │   └── itinerary.service.js     # Orchestration service
│   │
│   ├── middleware/
│   │   └── validateRequest.js # Request validation
│   │
│   └── utils/
│       ├── logger.new.js     # Logging utility
│       └── errorHandler.js   # Error handling
│
├── .env.example.new          # Environment template
├── package.new.json          # Dependencies
└── README.new.md             # This file
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example.new .env
# Edit .env and add your API keys
```

### 3. Start Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

## 📡 API Endpoints

### Create Trip Itinerary

```http
POST /api/trip/create
Content-Type: application/json

{
  "startingCity": "Mumbai",
  "days": 5,
  "theme": "Beach",
  "subTheme": "Budget",
  "currency": "INR"
}
```

### Get Available Options

```http
GET /api/trip/options
```

### Validate Services

```http
GET /api/trip/validate-services
```

### Health Check

```http
GET /api/health
```

## 🎨 Themes & Sub-Themes

### Themes
- **Beach** - Coastal destinations, water activities
- **Hillstation** - Mountain retreats, trekking
- **Work** - Business travel, meeting facilities
- **Nature** - Wildlife, eco-tourism
- **Family** - Kid-friendly, safe activities

### Sub-Themes
- **Luxury** - 5-star hotels, business class flights
- **Deluxe** - 4-star hotels, premium economy
- **Budget** - 3-star hotels, economy flights

## 📦 Response Format

```json
{
  "success": true,
  "data": {
    "tripSummary": {
      "title": "Tropical Beach Getaway",
      "description": "...",
      "totalDays": 5,
      "startingCity": "Mumbai",
      "theme": "Beach",
      "subTheme": "Budget"
    },
    "cities": [...],
    "activities": [...],
    "flights": [...],
    "hotels": [...],
    "weather": [...],
    "budget": {
      "estimated": {...},
      "currency": "INR"
    }
  }
}
```

## 🔑 External APIs

| Service | Purpose | Docs |
|---------|---------|------|
| Grok | AI recommendations | https://x.ai/api |
| OpenStreetMap | Geocoding, maps | https://nominatim.org |
| Amadeus | Flights & hotels | https://developers.amadeus.com |
| OpenWeatherMap | Weather forecasts | https://openweathermap.org/api |
| Exchange Rate | Currency conversion | https://exchangerate-api.com |

## 🛠️ Development

The backend is designed to be modular and extensible:

- **Services** wrap external APIs
- **Controllers** handle HTTP logic
- **Config** centralizes all settings
- **Middleware** validates requests
- **Utils** provide common functions

## 📝 License

MIT
