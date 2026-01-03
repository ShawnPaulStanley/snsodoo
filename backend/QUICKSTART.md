# Backend - Theme-Driven Travel Recommendation API

A modular, extensible Express.js backend that uses **Recommendation Profiles** to dynamically configure API behavior based on travel themes (beach, hillstation, business, nature_wellness, family) and sub-themes (budget, deluxe, luxurious).

## 🚀 Quick Start

```bash
cd backend
npm install
npm run dev
```

The server starts on `http://localhost:3000` (configurable via `PORT` in `.env`).

## 📋 Key Features

- **Theme-Driven Architecture**: Recommendation logic is data, not code
- **15 Theme Combinations**: 5 themes × 3 sub-themes = 15 unique profiles
- **Adapter Pattern**: Decouples business logic from API integrations
- **Zero Hardcoding**: No theme logic in controllers or services
- **Mocked APIs**: Ready for integration with real external APIs
- **LLM-Ready**: Each profile includes prompt bias strings

## 🎯 Available Endpoints

### Get Complete Recommendations
```bash
POST /api/recommendations
```
Returns hotels, flights, restaurants, transport, and weather based on theme.

### Focused Endpoints
- `POST /api/recommendations/hotels` - Hotels only
- `POST /api/recommendations/flights` - Flights only
- `POST /api/recommendations/restaurants` - Restaurants only

### Metadata
- `GET /api/recommendations/themes` - List all available theme combinations
- `GET /api/health` - Health check

## 📖 Example Request

```bash
curl -X POST http://localhost:3000/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "theme": "beach",
    "subTheme": "deluxe",
    "location": {
      "cityCode": "MIA",
      "latitude": 25.7617,
      "longitude": -80.1918
    },
    "dates": {
      "checkIn": "2026-03-01",
      "checkOut": "2026-03-05"
    }
  }'
```

## 🏗️ Architecture

This backend uses a **Recommendation Profile** pattern where all theme-specific logic lives in configuration files, not code.

```
Request → Controller → ThemeResolver → Profile
                    ↓
                Adapters → API Parameters
                    ↓
                Services → External APIs
                    ↓
                Adapters → Ranked Results
                    ↓
                Controller → Response
```

**Read [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed documentation.**

## 📂 Project Structure

```
src/
├── enums/              # Theme and SubTheme constants
├── config/             # Theme profiles (ALL business logic)
├── services/           # API integrations (theme-agnostic)
├── adapters/           # Profile → API params converters
├── controllers/        # Pure orchestration
├── routes/             # API routes
└── utils/              # Logger, API client
```

## 🔧 Environment Variables

Create `.env`:

```bash
PORT=3000
NODE_ENV=development
LOG_LEVEL=INFO

# Add when integrating real APIs:
# AMADEUS_API_KEY=your_key
# YELP_API_KEY=your_key
# OPENWEATHER_API_KEY=your_key
```

## 🎨 Available Themes

| Theme | Sub-Themes | Budget Range |
|-------|-----------|--------------|
| Beach | budget, deluxe, luxurious | $50-2000 |
| Hillstation | budget, deluxe, luxurious | $40-1800 |
| Business | budget, deluxe, luxurious | $80-2000 |
| Nature/Wellness | budget, deluxe, luxurious | $60-2200 |
| Family | budget, deluxe, luxurious | $70-2500 |

## 🚧 Current Status

- ✅ Complete architecture implemented
- ✅ 15 theme profiles configured
- ✅ Mocked API responses (hotels, flights, food, transport, weather)
- ✅ Ranking algorithms
- ✅ Full API documentation
- ⬜ Integration with real external APIs (requires API keys)
- ⬜ LLM semantic ranking (profile.llmBias ready)
- ⬜ Database persistence
- ⬜ Authentication

## 🔌 Integrating Real APIs

Services are ready for real API integration. Simply:

1. Add API keys to `.env`
2. Uncomment production API calls in services:
   - `src/services/hotels.service.js`
   - `src/services/flights.service.js`
   - `src/services/food.service.js`
   - `src/services/transport.service.js`
   - `src/services/weather.service.js`

The adapters will automatically convert theme profiles to API-specific parameters.

## 📚 Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Complete architecture documentation
- **Inline Comments** - Every file has detailed comments explaining the design

## 🎓 Key Concepts

### Recommendation Profile
A configuration object that contains:
- Budget ranges
- Hotel preferences (stars, amenities)
- Restaurant preferences (price, cuisine)
- Transport preferences (comfort, modes)
- Ranking weights (price vs quality vs distance)
- UI hints (colors, density)
- LLM bias strings

### Adapters
Convert generic profiles into API-specific parameters. Example:
```javascript
profile.hotelPreferences.starRating.min = 4
  → Amadeus API: ratings=[4,5]
  → Booking.com API: nflt=class=4-5
```

## 🤝 Contributing

This is a hackathon-optimized architecture. Key principles:
- **NO theme logic in controllers** - Always use profiles
- **NO theme logic in services** - Services are theme-agnostic
- **Add new themes** - Edit `themeProfiles.js` only
- **Add new APIs** - Create service + adapter pair

## 📝 Notes

- Uses ES modules (`type: "module"` in package.json)
- `nodemon` for development hot-reload
- Centralized error handling
- Structured logging
- CORS enabled for frontend integration

---

**Built with clean architecture and SOLID principles for hackathon speed and production scalability.** 🚀
