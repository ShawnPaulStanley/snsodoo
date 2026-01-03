/**
 * Weather Service
 * Handles weather forecasts using OpenWeatherMap API
 * 
 * @module services/weather.service
 */
import axios from 'axios';
import { env } from '../config/env.js';

// OpenWeatherMap API configuration
const WEATHER_API_URL = env.openweatherApiUrl;
const API_KEY = env.openweatherApiKey;

/**
 * Create axios instance for weather API
 */
const weatherClient = axios.create({
  baseURL: WEATHER_API_URL,
  timeout: 10000,
});

/**
 * Get current weather for a city
 * @param {string} city - City name
 * @param {string} country - Country code (optional)
 * @param {string} units - Units (metric, imperial, standard)
 * @returns {Promise<Object>} - Current weather data
 */
const getCurrentWeather = async (city, country = null, units = 'metric') => {
  const query = country ? `${city},${country}` : city;

  try {
    const response = await weatherClient.get('/weather', {
      params: {
        q: query,
        appid: API_KEY,
        units,
      },
    });

    const data = response.data;
    return {
      city: data.name,
      country: data.sys.country,
      coordinates: {
        lat: data.coord.lat,
        lon: data.coord.lon,
      },
      weather: {
        main: data.weather[0].main,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        iconUrl: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
      },
      temperature: {
        current: data.main.temp,
        feelsLike: data.main.feels_like,
        min: data.main.temp_min,
        max: data.main.temp_max,
        unit: units === 'metric' ? '°C' : units === 'imperial' ? '°F' : 'K',
      },
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      wind: {
        speed: data.wind.speed,
        direction: data.wind.deg,
        unit: units === 'metric' ? 'm/s' : 'mph',
      },
      clouds: data.clouds.all,
      visibility: data.visibility,
      sunrise: new Date(data.sys.sunrise * 1000).toISOString(),
      sunset: new Date(data.sys.sunset * 1000).toISOString(),
      timezone: data.timezone,
      timestamp: new Date(data.dt * 1000).toISOString(),
    };
  } catch (error) {
    console.error('Weather API error:', error.response?.data || error.message);
    if (error.response?.status === 404) {
      throw new Error(`City not found: ${query}`);
    }
    throw new Error('Failed to fetch weather data');
  }
};

/**
 * Get 5-day weather forecast for a city
 * @param {string} city - City name
 * @param {string} country - Country code (optional)
 * @param {string} units - Units (metric, imperial, standard)
 * @returns {Promise<Object>} - 5-day forecast data
 */
const getForecast = async (city, country = null, units = 'metric') => {
  const query = country ? `${city},${country}` : city;

  try {
    const response = await weatherClient.get('/forecast', {
      params: {
        q: query,
        appid: API_KEY,
        units,
      },
    });

    const data = response.data;

    // Group forecasts by day
    const dailyForecasts = {};
    data.list.forEach(item => {
      const date = item.dt_txt.split(' ')[0];
      if (!dailyForecasts[date]) {
        dailyForecasts[date] = [];
      }
      dailyForecasts[date].push({
        time: item.dt_txt,
        temp: item.main.temp,
        feelsLike: item.main.feels_like,
        tempMin: item.main.temp_min,
        tempMax: item.main.temp_max,
        humidity: item.main.humidity,
        weather: item.weather[0].main,
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        wind: item.wind.speed,
        clouds: item.clouds.all,
        rain: item.rain?.['3h'] || 0,
      });
    });

    // Calculate daily summaries
    const forecast = Object.keys(dailyForecasts).map(date => {
      const dayData = dailyForecasts[date];
      const temps = dayData.map(d => d.temp);
      const conditions = dayData.map(d => d.weather);
      
      // Most common weather condition
      const conditionCounts = conditions.reduce((acc, c) => {
        acc[c] = (acc[c] || 0) + 1;
        return acc;
      }, {});
      const mainCondition = Object.keys(conditionCounts).reduce((a, b) => 
        conditionCounts[a] > conditionCounts[b] ? a : b
      );

      return {
        date,
        tempMin: Math.min(...temps),
        tempMax: Math.max(...temps),
        tempAvg: temps.reduce((a, b) => a + b, 0) / temps.length,
        humidity: dayData.reduce((a, d) => a + d.humidity, 0) / dayData.length,
        weather: mainCondition,
        hourly: dayData,
      };
    });

    return {
      city: data.city.name,
      country: data.city.country,
      coordinates: data.city.coord,
      timezone: data.city.timezone,
      forecast,
      temperatureUnit: units === 'metric' ? '°C' : units === 'imperial' ? '°F' : 'K',
    };
  } catch (error) {
    console.error('Weather API error:', error.response?.data || error.message);
    if (error.response?.status === 404) {
      throw new Error(`City not found: ${query}`);
    }
    throw new Error('Failed to fetch weather forecast');
  }
};

/**
 * Get weather by coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} units - Units (metric, imperial, standard)
 * @returns {Promise<Object>} - Current weather data
 */
const getWeatherByCoords = async (lat, lon, units = 'metric') => {
  try {
    const response = await weatherClient.get('/weather', {
      params: {
        lat,
        lon,
        appid: API_KEY,
        units,
      },
    });

    const data = response.data;
    return {
      city: data.name,
      country: data.sys.country,
      coordinates: { lat, lon },
      weather: {
        main: data.weather[0].main,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
      },
      temperature: {
        current: data.main.temp,
        feelsLike: data.main.feels_like,
        min: data.main.temp_min,
        max: data.main.temp_max,
      },
      humidity: data.main.humidity,
      wind: {
        speed: data.wind.speed,
        direction: data.wind.deg,
      },
    };
  } catch (error) {
    console.error('Weather API error:', error.response?.data || error.message);
    throw new Error('Failed to fetch weather by coordinates');
  }
};

/**
 * Determine seasonal suitability for travel
 * @param {string} city - City name
 * @param {string} month - Month (1-12 or name)
 * @returns {Promise<Object>} - Seasonal suitability assessment
 */
const getSeasonalSuitability = async (city, month) => {
  // First get current weather to understand the location
  const current = await getCurrentWeather(city);
  const forecast = await getForecast(city);

  // Simple seasonal assessment based on current data
  // In production, you'd want historical climate data
  const avgTemp = forecast.forecast.reduce((sum, day) => sum + day.tempAvg, 0) / forecast.forecast.length;
  const avgHumidity = forecast.forecast.reduce((sum, day) => sum + day.humidity, 0) / forecast.forecast.length;
  const rainyDays = forecast.forecast.filter(day => 
    day.weather.toLowerCase().includes('rain')
  ).length;

  let suitability = 'good';
  let recommendations = [];

  if (avgTemp < 5) {
    suitability = 'cold';
    recommendations.push('Pack warm clothing');
  } else if (avgTemp > 35) {
    suitability = 'hot';
    recommendations.push('Stay hydrated, avoid midday activities');
  }

  if (avgHumidity > 80) {
    recommendations.push('High humidity expected');
  }

  if (rainyDays > 3) {
    recommendations.push('Rain likely, pack waterproof gear');
  }

  return {
    city,
    month,
    suitability,
    averageTemperature: avgTemp,
    averageHumidity: avgHumidity,
    rainyDays: rainyDays,
    recommendations,
    currentConditions: current,
    upcomingForecast: forecast.forecast,
  };
};

// Export all functions
export const weatherService = {
  getCurrentWeather,
  getForecast,
  getWeatherByCoords,
  getSeasonalSuitability,
};

export default weatherService;
