const axios = require('axios');
const config = require('../config/config');

// Cache for weather data to avoid hitting API limits
const weatherCache = new Map();
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

async function getWeatherForecast(latitude, longitude, date) {
  const cacheKey = `${latitude},${longitude},${date}`;
  const cachedData = weatherCache.get(cacheKey);
  
  if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
    return cachedData.data;
  }

  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${config.weatherApiKey}&units=imperial`
    );

    // Find the forecast closest to the ride date
    const rideDate = new Date(date);
    const forecast = response.data.list.find(item => {
      const forecastDate = new Date(item.dt * 1000);
      return Math.abs(forecastDate - rideDate) < 1000 * 60 * 60 * 3; // Within 3 hours
    });

    if (!forecast) {
      return null;
    }

    const weatherData = {
      temperature: Math.round(forecast.main.temp),
      description: forecast.weather[0].description,
      windSpeed: Math.round(forecast.wind.speed),
      precipitation: forecast.pop * 100, // Convert to percentage
      icon: forecast.weather[0].icon
    };

    // Cache the result
    weatherCache.set(cacheKey, {
      data: weatherData,
      timestamp: Date.now()
    });

    return weatherData;
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
}

function formatWeatherEmbed(weatherData) {
  if (!weatherData) return null;

  const weatherEmoji = {
    '01d': '☀️', // clear sky
    '01n': '🌙', // clear night
    '02d': '⛅', // few clouds
    '02n': '☁️', // few clouds night
    '03d': '☁️', // scattered clouds
    '03n': '☁️', // scattered clouds night
    '04d': '☁️', // broken clouds
    '04n': '☁️', // broken clouds night
    '09d': '🌧️', // shower rain
    '09n': '🌧️', // shower rain night
    '10d': '🌦️', // rain
    '10n': '🌧️', // rain night
    '11d': '⛈️', // thunderstorm
    '11n': '⛈️', // thunderstorm night
    '13d': '🌨️', // snow
    '13n': '🌨️', // snow night
    '50d': '🌫️', // mist
    '50n': '🌫️'  // mist night
  };

  const emoji = weatherEmoji[weatherData.icon] || '❓';
  
  return {
    name: 'Weather Forecast',
    value: `${emoji} ${weatherData.temperature}°F, ${weatherData.description}\n💨 Wind: ${weatherData.windSpeed} mph\n💧 Rain chance: ${Math.round(weatherData.precipitation)}%`,
    inline: true
  };
}

module.exports = {
  getWeatherForecast,
  formatWeatherEmbed
}; 