# Travel Recommendation Backend - Architecture Documentation

## Overview

This backend implements a **theme-driven recommendation system** for a travel platform. The core innovation is that ALL recommendation logic is controlled by **Recommendation Profiles** rather than hardcoded in controllers or services.

## Key Architectural Principles

### 1. **Separation of Concerns**
- **Theme Logic** → Config files (`themeProfiles.js`)
- **API Integration** → Services (theme-agnostic)
- **Parameter Translation** → Adapters
- **Orchestration** → Controllers (pure coordination)

### 2. **Zero Hardcoding**
- Controllers have NO theme-specific logic
- Services have NO theme-specific logic
- All theme behavior is in ONE place: `themeProfiles.js`

### 3. **Easy Extensibility**
- Add new theme: Edit `themeProfiles.js` only
- Add new API: Create new service + adapter
- Add new sub-theme: Add new profile configuration

---

## Architecture Layers

```
┌─────────────────────────────────────────────────────┐
│                   CONTROLLER                        │
│              (Pure Orchestration)                   │
│   - Validates inputs                               │
│   - Resolves theme → profile                       │
│   - Coordinates adapters + services                │
│   - Aggregates results                             │
└──────────────┬──────────────────────────────────────┘
               │
               ▼
┌──────────────────────────┐    ┌──────────────────────┐
│   THEME RESOLVER         │    │    ADAPTERS          │
│                          │    │                      │
│  - Maps (theme,subTheme) │◄───┤ - Profile → API Params│
│    → RecommendationProfile│    │ - Ranking logic      │
└──────────────────────────┘    └──────────┬───────────┘
               │                            │
               ▼                            ▼
┌──────────────────────────┐    ┌──────────────────────┐
│   THEME PROFILES         │    │    API SERVICES      │
│   (Configuration)        │    │  (Theme-Agnostic)    │
│                          │    │                      │
│  - Budget ranges         │    │ - Make API calls     │
│  - Hotel preferences     │    │ - Return raw data    │
│  - Restaurant filters    │    │ - Handle errors      │
│  - Ranking weights       │    │                      │
│  - UI hints              │    └──────────────────────┘
│  - LLM bias strings      │
└──────────────────────────┘
```

---

## Complete Request Flow Example

### Scenario: User wants "Beach + Deluxe" recommendations

1. **Request arrives at controller**
   ```json
   POST /api/recommendations
   {
     "theme": "beach",
     "subTheme": "deluxe",
     "location": { "latitude": 25.7617, "longitude": -80.1918 }
   }
   ```

2. **Controller calls ThemeResolver**
   ```javascript
   const profile = themeResolver.resolveProfile('beach', 'deluxe');
   // Returns: Budget Beach Vacation profile
   ```

3. **Profile contains:**
   ```javascript
   {
     budgetRange: { min: 200, max: 500 },
     hotelPreferences: {
       starRating: { min: 4, max: 4.5 },
       amenities: ['wifi', 'pool', 'spa', 'beach_access'],
     },
     restaurantPreferences: {
       priceLevel: { min: 2, max: 3 },
       cuisineTypes: ['seafood', 'international'],
     },
     rankingWeights: {
       price: 0.2,
       rating: 0.5,
       distance: 0.3,
     }
   }
   ```

4. **Controller uses adapters to convert profile → API params**
   ```javascript
   const hotelParams = hotelAdapter.toAmadeusParams(profile, searchContext);
   // Returns: { radius: 500, ratings: [4, 4.5], amenities: ['WIFI', 'SWIMMING_POOL', 'SPA'], ... }
   ```

5. **Controller calls services with API params**
   ```javascript
   const hotels = await hotelService.searchHotels(hotelParams);
   // Service has NO IDEA about "beach" or "deluxe" - it only knows API parameters
   ```

6. **Adapter ranks results using profile weights**
   ```javascript
   const rankedHotels = hotelAdapter.rankHotels(hotels, profile);
   // Uses rankingWeights to score: price*0.2 + rating*0.5 + distance*0.3
   ```

7. **Controller returns aggregated response**
   ```json
   {
     "profile": { "theme": "beach", "subTheme": "deluxe" },
     "hotels": [...],
     "uiHints": { "primaryColor": "#0ea5e9" },
     "llmBias": "Emphasize quality beachfront resorts..."
   }
   ```

---

## File Structure

```
backend/src/
├── enums/
│   └── theme.enum.js              # Theme and SubTheme constants
│
├── config/
│   ├── env.js                     # Environment variables
│   └── themeProfiles.js           # ALL THEME LOGIC LIVES HERE
│
├── services/
│   ├── themeResolver.service.js   # Maps theme → profile
│   ├── hotels.service.js          # Hotel API calls (theme-agnostic)
│   ├── flights.service.js         # Flight API calls
│   ├── food.service.js            # Restaurant API calls
│   ├── transport.service.js       # Transport API calls
│   └── weather.service.js         # Weather API calls
│
├── adapters/
│   ├── hotelParams.adapter.js     # Profile → Hotel API params + ranking
│   ├── flightParams.adapter.js    # Profile → Flight API params + ranking
│   ├── foodParams.adapter.js      # Profile → Restaurant API params + ranking
│   └── transportParams.adapter.js # Profile → Transport API params + ranking
│
├── controllers/
│   └── recommendation.controller.js # Orchestrates everything (NO business logic)
│
├── routes/
│   ├── index.js                    # Route aggregator
│   └── recommendation.routes.js    # Recommendation endpoints
│
├── utils/
│   ├── apiClient.js               # Centralized HTTP client
│   └── logger.js                  # Logging utility
│
├── app.js                         # Express app setup
└── server.js                      # Server entry point
```

---

## API Endpoints

### 1. **Get Complete Recommendations**
```
POST /api/recommendations
```

**Request Body:**
```json
{
  "theme": "beach",
  "subTheme": "deluxe",
  "location": {
    "cityCode": "MIA",
    "latitude": 25.7617,
    "longitude": -80.1918
  },
  "dates": {
    "checkIn": "2026-03-01",
    "checkOut": "2026-03-05",
    "departureDate": "2026-03-01",
    "returnDate": "2026-03-05"
  },
  "guests": {
    "adults": 2,
    "children": 1,
    "rooms": 1
  },
  "passengers": {
    "adults": 2,
    "children": 1,
    "infants": 0
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "profile": {
      "theme": "beach",
      "subTheme": "deluxe",
      "name": "Deluxe Beach Experience",
      "budgetRange": { "min": 200, "max": 500 }
    },
    "uiHints": {
      "primaryColor": "#0ea5e9",
      "accentColor": "#f59e0b",
      "density": "comfortable"
    },
    "hotels": [...],
    "flights": [...],
    "restaurants": [...],
    "transport": [...],
    "weather": {...}
  }
}
```

### 2. **Get Hotels Only**
```
POST /api/recommendations/hotels
```

### 3. **Get Flights Only**
```
POST /api/recommendations/flights
```

### 4. **Get Restaurants Only**
```
POST /api/recommendations/restaurants
```

### 5. **Get Available Themes**
```
GET /api/recommendations/themes
```

**Response:**
```json
{
  "success": true,
  "data": [
    { "theme": "beach", "subTheme": "budget", "name": "Budget Beach Vacation" },
    { "theme": "beach", "subTheme": "deluxe", "name": "Deluxe Beach Experience" },
    { "theme": "beach", "subTheme": "luxurious", "name": "Luxury Beach Paradise" },
    ...
  ]
}
```

---

## How to Add New Features

### Adding a New Theme (e.g., "Adventure")

1. **Add to enum:**
   ```javascript
   // enums/theme.enum.js
   const Theme = Object.freeze({
     BEACH: 'beach',
     HILLSTATION: 'hillstation',
     ADVENTURE: 'adventure', // NEW
   });
   ```

2. **Add profiles:**
   ```javascript
   // config/themeProfiles.js
   [`${Theme.ADVENTURE}_${SubTheme.BUDGET}`]: {
     name: 'Budget Adventure',
     budgetRange: { min: 60, max: 180 },
     hotelPreferences: { ... },
     activityCategories: ['hiking', 'rafting', 'climbing'],
     // ...
   }
   ```

3. **Done!** All adapters and services automatically work.

### Adding a New API (e.g., Activities API)

1. **Create service:**
   ```javascript
   // services/activities.service.js
   async searchActivities(params) {
     // Make API call with params
   }
   ```

2. **Create adapter:**
   ```javascript
   // adapters/activityParams.adapter.js
   toActivityParams(profile, searchContext) {
     // Convert profile.activityCategories → API params
   }
   ```

3. **Update controller:**
   ```javascript
   const activities = await activityService.searchActivities(
     activityAdapter.toActivityParams(profile, searchContext)
   );
   ```

### Adding LLM Integration

The architecture is **LLM-ready**. Each profile has an `llmBias` string:

```javascript
llmBias: 'Focus on affordable beachfront experiences, local seafood, and budget-friendly water activities.'
```

To integrate:
1. Create `services/llm.service.js`
2. Use `profile.llmBias` as a prompt fragment
3. Combine with API results for semantic ranking

---

## Environment Variables

Create `.env` file:

```bash
# Server
PORT=3000
NODE_ENV=development

# API Keys (add when integrating real APIs)
AMADEUS_API_KEY=your_key
AMADEUS_API_SECRET=your_secret
YELP_API_KEY=your_key
OPENWEATHER_API_KEY=your_key
ROME2RIO_API_KEY=your_key

# Logging
LOG_LEVEL=INFO
```

---

## Testing the API

### Using curl:

```bash
# Get complete recommendations
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

# Get available themes
curl http://localhost:3000/api/recommendations/themes
```

### Using Postman:
Import the example requests from above.

---

## Current Limitations & Future Enhancements

### Current:
- API calls are mocked (return dummy data)
- No authentication/authorization
- No rate limiting
- No caching
- No database persistence

### Future Enhancements:
1. **Real API Integration:** Replace mocked services with actual API calls
2. **LLM Layer:** Add semantic ranking using LLMs
3. **Caching:** Redis for API response caching
4. **Database:** Store user preferences, bookings
5. **Authentication:** JWT-based auth
6. **Rate Limiting:** Prevent API abuse
7. **Webhooks:** Real-time price updates
8. **Analytics:** Track recommendation performance

---

## Why This Architecture?

### ✅ Advantages:
- **Easy to understand:** Clear separation of concerns
- **Easy to test:** Each layer can be tested independently
- **Easy to extend:** Add themes/APIs without touching existing code
- **Hackathon-friendly:** Fast iteration, clear structure
- **Production-ready foundation:** Can scale with real APIs

### ⚠️ Trade-offs:
- More files (but better organization)
- Learning curve for adapters pattern (but pays off)
- Profiles can get large (but centralized is better than scattered)

---

## Summary

This backend is designed with **one core principle:**

> **Business logic should be DATA, not CODE.**

Instead of writing:
```javascript
if (theme === 'beach' && subTheme === 'budget') {
  // hardcoded logic
}
```

We write:
```javascript
const profile = themeResolver.resolveProfile(theme, subTheme);
// profile contains ALL the logic as data
```

This makes the system:
- **Maintainable:** Change behavior by editing config, not code
- **Testable:** Test profiles, not control flow
- **Explainable:** Anyone can understand a profile object
- **Scalable:** Add unlimited themes without code changes

Perfect for a **hackathon** where you need to iterate fast and explain clearly to judges! 🚀
