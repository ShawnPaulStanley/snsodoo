/**
 * WEATHER SERVICE
 * 
 * Purpose: Handles weather-related API calls.
 * Used to provide weather context for recommendations.
 * 
 * In production, would integrate with:
 * - OpenWeatherMap API
 * - Weather.com API
 */

import apiClient from '../utils/apiClient.js';

class WeatherService {
  /**
   * Get current weather for a location
   * 
   * @param {Object} location - { latitude, longitude }
   * @returns {Promise<Object>} Weather data
   */
  async getCurrentWeather(location) {
    try {
      // In production:
      // const response = await apiClient.get('https://api.openweathermap.org/data/2.5/weather', {
      //   params: {
      //     lat: location.latitude,
      //     lon: location.longitude,
      //     appid: process.env.OPENWEATHER_API_KEY,
      //     units: 'metric'
      //   }
      // });
      // return response.data;

      return this._getMockedWeather(location);
    } catch (error) {
      console.error('Error fetching weather:', error.message);
      throw new Error('Failed to fetch weather data');
    }
  }

  /**
   * Get weather forecast for next 7 days
   * 
   * @param {Object} location 
   * @returns {Promise<Object>}
   */
  async getWeatherForecast(location) {
    try {
      return this._getMockedForecast(location);
    } catch (error) {
      console.error('Error fetching forecast:', error.message);
      throw new Error('Failed to fetch weather forecast');
    }
  }

  /**
   * PRIVATE: Mocked data
   */
  _getMockedWeather(location) {
    return {
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
      current: {
        temp: 28, // Celsius
        feels_like: 30,
        humidity: 65,
        pressure: 1013,
        wind_speed: 5.5,
        weather: {
          main: 'Clear',
          description: 'clear sky',
          icon: '01d',
        },
      },
      timestamp: new Date().toISOString(),
    };
  }

  _getMockedForecast(location) {
    const forecast = [];
    const baseTemp = 28;

    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);

      forecast.push({
        date: date.toISOString().split('T')[0],
        temp: {
          min: baseTemp - 5 + Math.random() * 3,
          max: baseTemp + Math.random() * 5,
        },
        weather: {
          main: i % 3 === 0 ? 'Rain' : 'Clear',
          description: i % 3 === 0 ? 'light rain' : 'clear sky',
        },
        precipitation: i % 3 === 0 ? 30 : 0, // probability
      });
    }

    return {
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
      forecast,
    };
  }
}

export default new WeatherService();
