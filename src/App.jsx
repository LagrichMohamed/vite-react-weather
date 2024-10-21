import { Oval } from 'react-loader-spinner';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFrown } from '@fortawesome/free-solid-svg-icons';
import './App.css';

function Grp204WeatherApp() {
  const [input, setInput] = useState('');
  const [weather, setWeather] = useState({
    loading: false,
    data: [],
    error: false,
  });
  const [showMore, setShowMore] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);

  useEffect(() => {
    const storedCities = JSON.parse(localStorage.getItem('searchHistory')) || [];
    setSearchHistory(storedCities);
  }, []);

  const toDateFunction = (timestamp) => {
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août',
      'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    const WeekDays = [
      'Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'
    ];
    const date = new Date(timestamp * 1000);  // Convert timestamp to milliseconds
    return `${WeekDays[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
  };

  const search = async (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      fetchWeatherForCity(input);  // Using input from search bar
    }
  };

  const fetchWeatherForCity = async (cityName) => {
    setWeather({ ...weather, loading: true });
    const url = 'https://api.openweathermap.org/data/2.5/forecast';
    const api_key = 'f00c38e0279b7bc85480c3fe775d518c';

    await axios
      .get(url, {
        params: {
          q: cityName,
          units: 'metric',
          appid: api_key,
        },
      })
      .then((res) => {
        setWeather({ data: res.data, loading: false, error: false });
        handleSearchHistory(res.data.city.name); // Store city in search history
        setInput(''); // Clear input field after fetching
        setShowMore(false); // Reset showMore state
      })
      .catch(() => {
        setWeather({ ...weather, data: [], error: true });
        setInput('');
      });
  };

  const handleSearchHistory = (cityName) => {
    // Update search history, move the city to the top if it's already in history
    let updatedHistory = searchHistory.filter((city) => city !== cityName);
    updatedHistory = [cityName, ...updatedHistory];

    // Store the updated history in both state and localStorage
    setSearchHistory(updatedHistory);
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
  };

  const showMoreForecast = () => {
    setShowMore(!showMore);
  };

  const groupForecastByDay = (forecastList) => {
    const groupedForecast = [];
    const usedDays = new Set();

    forecastList.forEach((forecast) => {
      const date = new Date(forecast.dt * 1000).getDate(); // Extract the day of the month

      if (!usedDays.has(date)) {
        groupedForecast.push(forecast);
        usedDays.add(date);
      }
    });

    return groupedForecast;
  };

  const renderForecastCard = (weatherData, index, name, details) => {
    return (
      <div key={index} className={name}> {/* Use name parameter here */}
        <h4>{toDateFunction(weatherData.dt)}</h4>
        <div className="weather-icon">
          <img
            src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
            alt={weatherData.weather[0].description}
          />
        </div>
        <p>{Math.round(weatherData.main.temp)}°C</p>
        {details && (
          <p>Vitesse du vent : {weatherData.wind.speed} m/s</p>
        )}
      </div>
    );
  };

  return (
    <div className="App">
      <h1 className="app-name">Application Météo grp204</h1>
      <div className="container">
        <div className="search-bar">
          <input
            type="text"
            className="city-search"
            placeholder="Entrez le nom de la ville..."
            name="query"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyPress={search}
          />
        </div>

        {weather.loading && (
          <div className="loader">
            <Oval type="Oval" color="black" height={60} width={60} />
          </div>
        )}

        {weather.error && (
          <span className="error-message">
            <FontAwesomeIcon icon={faFrown} />
            <span>Ville introuvable</span>
          </span>
        )}

        {weather && weather.data.list && weather.data.list.length > 0 && (
          <>
            <div className="weather-card">
              <h2>
                {weather.data.city.name}, {weather.data.city.country}
              </h2>
              <span>{toDateFunction(weather.data.list[0].dt)}</span>
              <div className="weather-icon">
                <img
                  src={`https://openweathermap.org/img/wn/${weather.data.list[0].weather[0].icon}@2x.png`}
                  alt={weather.data.list[0].weather[0].description}
                />
              </div>
              <p>{Math.round(weather.data.list[0].main.temp)}°C</p>
              <p>Vitesse du vent : {weather.data.list[0].wind.speed} m/s</p>
            </div>

            {showMore && (
              <div className="forecast1">
                {groupForecastByDay(weather.data.list).slice(1,).map((weatherData, index) => 
                  renderForecastCard(weatherData, index, `weather-card1`, false) 
                )}
              </div>
            )}

            <button className="show-more-btn" onClick={showMoreForecast}>
              {showMore ? 'Cacher' : 'Afficher plus'}
            </button>
          </>
        )}

        <div className="history">
          <h3>Historique des Recherches</h3>
          <div className="history-cards">
            {searchHistory.map((city, index) => (
              <div
                key={index}
                className="history-card"
                onClick={() => fetchWeatherForCity(city)}  
              >
                <p>{city}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Grp204WeatherApp;
