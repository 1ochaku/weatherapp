const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-button");
const locationButton = document.querySelector(".location-button");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_key = "4a5a35fa3ef1e01eff0df044bc0e4f02";

// it displays the data on the site
const createWeatherCard = (cityName, weatherItem, index) => {
    if(index === 0){
        return `<div class = "details">
                    <h2>${cityName} on (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)} °C
                    <h4>Wind Speed: ${weatherItem.wind.speed} m/s</h4>
                    <h4>Humidity: ${weatherItem.main.humidity} %</h4>
                </div>
                <div class = "icon">
                    <img src = "https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt = "weather-icon">
                    <h4>${weatherItem.weather[0].description}</h4>
                </div>`;
    }else{
        return `<li class = "card">
                <h3>On (${weatherItem.dt_txt.split(" ")[0]})</h3>
                <img src = "https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt = "weather-icon">
                <h6 style="padding-left: 10px; text-indent: -10px;">( ${weatherItem.weather[0].description} )</h6>
                <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)} °C</h4>  
                <h4>Wind Speed: ${weatherItem.wind.speed} m/s</h4>
                <h4>Humidity: ${weatherItem.main.humidity} %</h4>
            </li>`;
    }
}

const getWeatherDetails = (cityName, latitude, longitude) => {
    const weather_api_url = `http://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_key}`;
    
    fetch(weather_api_url).then(response => response.json()).then(data => { 
        // it filters the content so to get one forecast per day
        const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if(!uniqueForecastDays.includes(forecastDate)){
                return uniqueForecastDays.push(forecastDate);
            }
        });

        // here it clears the previous weather data
        cityInput.value = "";
        currentWeatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";

        // creating weather cards and adding them to DOM
        fiveDaysForecast.forEach((weatherItem,index) => {
            const html = createWeatherCard(cityName, weatherItem, index);
            if(index === 0){
                currentWeatherDiv.insertAdjacentHTML("beforeend",html);
            } else{
                weatherCardsDiv.insertAdjacentHTML("beforeend",html);
            }
        });
    }).catch(() => {
        alert("Oops, hailstorm came in my place so failed to get the weather forecast!");
    });

}

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if(cityName==="") return;
    const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_key}`;

    // here it fetches the entered city's coordinates from the API response
    fetch(GEOCODING_API_URL).then(response => response.json()).then(data => {
        if(!data.length) return alert("I guess you entered a wrong place name.");
        const { lat, lon,name} = data[0];
        getWeatherDetails(name,lat,lon);
    }).catch(() => {
        alert("I guess you entered a wrong place name.");
    });
}

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const {latitude,longitude} = position.coords; 
            const REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&appid=${API_key}`;
            
            // here it retrieves the city name from coordinates
            fetch(REVERSE_GEOCODING_URL).then(response => response.json()).then(data => {
                const { name } = data[0];
                getWeatherDetails(name,latitude,longitude);
            }).catch(() => {
                alert("Oops, couldn't get to your city!");
            });
        },
            // here it tells the user that he denied the location permission
            error => {
                if(error.code === error.PERMISSION_DENIED){
                    alert("Hey, you denied geolocation request. Reset location permission to grant access again.");
                } else{
                    alert("It's geolocation request error. Reset location permission.");
                }
            }
    );
}
locationButton.addEventListener("click",getUserCoordinates);
searchButton.addEventListener("click",getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());
