/**
 * FLIGHT SERVICE
 * 
 * Purpose: Handles all flight-related API calls.
 * Theme-agnostic - only knows about API parameters.
 * 
 * In production, would integrate with:
 * - Amadeus Flight API
 * - Skyscanner API
 * - Kiwi.com API
 */

import apiClient from '../utils/apiClient.js';

class FlightService {
  /**
   * Search for flights
   * 
   * @param {Object} params - API-ready parameters from FlightParamsAdapter
   * @returns {Promise<Array>} List of flights
   */
  async searchFlights(params) {
    try {
      // In production:
      // const response = await apiClient.get('https://api.amadeus.com/v2/shopping/flight-offers', { params });
      // return response.data.data;

      return this._getMockedFlights(params);
    } catch (error) {
      console.error('Error fetching flights:', error.message);
      throw new Error('Failed to fetch flights');
    }
  }

  /**
   * Get flight details by ID
   * 
   * @param {string} flightId 
   * @returns {Promise<Object>}
   */
  async getFlightDetails(flightId) {
    try {
      return this._getMockedFlightDetails(flightId);
    } catch (error) {
      console.error('Error fetching flight details:', error.message);
      throw new Error('Failed to fetch flight details');
    }
  }

  /**
   * PRIVATE: Mocked data
   */
  _getMockedFlights(params) {
    const flights = [];
    const count = params.max || 10;

    for (let i = 0; i < count; i++) {
      const isNonStop = params.nonStop || Math.random() > 0.5;
      
      flights.push({
        id: `FLIGHT_${i + 1}`,
        price: {
          total: this._generateFlightPrice(params.travelClass, params.maxPrice),
          currency: params.currencyCode || 'USD',
        },
        airline: this._getRandomAirline(),
        travelClass: params.travelClass || 'ECONOMY',
        segments: isNonStop ? 1 : Math.floor(Math.random() * 2) + 1,
        duration: this._generateDuration(isNonStop),
        departureTime: `${params.departureDate}T08:00:00`,
        arrivalTime: `${params.departureDate}T14:30:00`,
        origin: params.originLocationCode,
        destination: params.destinationLocationCode,
        availableSeats: Math.floor(Math.random() * 50) + 10,
      });
    }

    return flights;
  }

  _getMockedFlightDetails(flightId) {
    return {
      id: flightId,
      price: {
        total: 450,
        currency: 'USD',
        breakdown: {
          base: 400,
          taxes: 50,
        },
      },
      airline: 'United Airlines',
      flightNumber: 'UA123',
      aircraft: 'Boeing 737',
      travelClass: 'ECONOMY',
      segments: [
        {
          departure: {
            airport: 'JFK',
            time: '2026-02-15T08:00:00',
            terminal: '4',
          },
          arrival: {
            airport: 'LAX',
            time: '2026-02-15T11:30:00',
            terminal: '7',
          },
          duration: 'PT5H30M',
        },
      ],
      baggage: {
        checked: '1 bag',
        carry_on: '1 bag',
      },
      amenities: ['wifi', 'meals', 'entertainment'],
    };
  }

  _generateFlightPrice(travelClass, maxPrice) {
    const basePrice = {
      'ECONOMY': 300,
      'PREMIUM_ECONOMY': 600,
      'BUSINESS': 1200,
      'FIRST': 2500,
    };

    const base = basePrice[travelClass] || 300;
    const variance = Math.floor(Math.random() * 200) - 100;
    const price = base + variance;

    return maxPrice ? Math.min(price, maxPrice) : price;
  }

  _getRandomAirline() {
    const airlines = [
      'United Airlines',
      'Delta Air Lines',
      'American Airlines',
      'Southwest Airlines',
      'JetBlue Airways',
      'Spirit Airlines',
    ];
    return airlines[Math.floor(Math.random() * airlines.length)];
  }

  _generateDuration(isNonStop) {
    if (isNonStop) {
      const hours = Math.floor(Math.random() * 4) + 2; // 2-6 hours
      const minutes = Math.floor(Math.random() * 60);
      return `PT${hours}H${minutes}M`;
    } else {
      const hours = Math.floor(Math.random() * 6) + 5; // 5-11 hours
      const minutes = Math.floor(Math.random() * 60);
      return `PT${hours}H${minutes}M`;
    }
  }
}

export default new FlightService();
