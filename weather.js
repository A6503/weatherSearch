const key = "qTfhxiGQiKXsEctMxGjBbGwX5cJZMABc";
const coord = "43.8106064,-79.3658743";
var searchResults = [];
var boxes = ["query1", "query2", "query3", "query4", "query5", "query6", "query7", "query8", "query9", "query10"];

window.onload = function(){
  // These are for buttons
  document.getElementById("searchButton").onclick = function () {
    mySearch();
    document.getElementById("qInfo").classList.add("showQuery");
  };
  for (let i = 0; i < boxes.length; i++){
    document.getElementById(boxes[i]).onclick = function () {
      document.getElementById("qInfo").classList.remove("showQuery");
      boxes.forEach(refreshResults);
      getCityFromID(searchResults[i]).then(function(city) {
        getWeatherFromID(searchResults[i]).then(function(weather) {
          document.getElementById(boxes[i]).innerHTML =  "Your City: " + city + "<br>"+  "Current Weather: " + weather;
          document.getElementById(boxes[i]).classList.add("showQuery");
        })
      }
      )
      
    }
  };
}

async function searchLocation(search){
    const baseUrl = "http://dataservice.accuweather.com/locations/v1/cities/autocomplete";
    const query = `?apikey=${key}&q=${search}`;

    const res = await fetch(baseUrl + query);
    const data = await res.json();
    
    var keyList = [];  
    var cityList = [];
    var stateList = [];
    var countryList = [];
    
    console.log(JSON.parse(JSON.stringify(data)));
    for (let i = 0; i < data.length; i++){
      keyList.push(JSON.parse(JSON.stringify(data))[i].Key);
      cityList.push(JSON.parse(JSON.stringify(data))[i].LocalizedName);
      stateList.push(JSON.parse(JSON.stringify(data))[i].AdministrativeArea.LocalizedName);
      countryList.push(JSON.parse(JSON.stringify(data))[i].Country.LocalizedName);
    }
    const results = {keys:keyList, cities:cityList, states:stateList, countries:countryList};
    return results;
}
function mySearch(){
  searchResults = [];
  stringResults = [];
  searchLocation(document.getElementById('cityInput').value).then(function(results) {
    for (let i = 0; i < results.cities.length; i++){
      stringResults.push(results.cities[i] + ", " + results.states[i] + ", " + results.countries[i]);
      searchResults.push(results.keys[i]);
    }
    displayResults(stringResults);
  })
  
  return;
}

function displayResults(strings){
  boxes.forEach(refreshResults);
  if(searchResults.length == 0){
    document.getElementById(boxes[0]).innerHTML = "No results found";
    document.getElementById(boxes[0]).classList.add("error");
    document.getElementById(qInfo).classList.remove("showQuery");
    return;
  }
  for(i = 0; i < searchResults.length; i++){
    document.getElementById(boxes[i]).innerHTML = strings[i];
    document.getElementById(boxes[i]).classList.add("showQuery");
  }
  
}

async function getCityFromCoord(gPos){
    const baseUrl = "http://dataservice.accuweather.com/locations/v1/cities/geoposition/search";
    const query = `?apikey=${key}&q=${gPos.coords.latitude}%2C${gPos.coords.longitude}&toplevel=true`;

    var str = "";
    const res = await fetch(baseUrl + query);
    const data = await res.json();
    str += JSON.parse(JSON.stringify(data)).EnglishName + ", ";
    str += JSON.parse(JSON.stringify(data)).AdministrativeArea.EnglishName + ", ";
    str += JSON.parse(JSON.stringify(data)).Country.EnglishName;
    return str;
}

async function getCityFromID(id){
  const baseUrl = `http://dataservice.accuweather.com/locations/v1/${id}`;
  const query = `?apikey=${key}`;

  var str = "";
  const res = await fetch(baseUrl + query);
  const data = await res.json();
  str += JSON.parse(JSON.stringify(data)).EnglishName + ", ";
  str += JSON.parse(JSON.stringify(data)).AdministrativeArea.EnglishName + ", ";
  str += JSON.parse(JSON.stringify(data)).Country.EnglishName;
  return str;
}

async function getWeatherFromCoord(gPos){
    const cityQuery = `http://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=${key}&q=${gPos.coords.latitude}%2C${gPos.coords.longitude}&toplevel=true`;
    const cityResource = await fetch(cityQuery);
    const cityData = await cityResource.json();
    const city = JSON.parse(JSON.stringify(cityData));

    const forecastUrl = `http://dataservice.accuweather.com/forecasts/v1/daily/1day/${JSON.parse(JSON.stringify(city)).Key}?apikey=${key}`;
    const res = await fetch(forecastUrl);
    const data = await res.json();
    const forecast = JSON.parse(JSON.stringify(data)).DailyForecasts;
    const currentDay = JSON.parse(JSON.stringify(forecast[0])).Day.IconPhrase;
    
    return currentDay;
}

async function getWeatherFromID(id){
    const baseUrl = `http://dataservice.accuweather.com/forecasts/v1/daily/1day/${id}`;
    const query = `?apikey=${key}`;

    const res = await fetch(baseUrl + query);
    const data = await res.json();
    const forecast = JSON.parse(JSON.stringify(data)).DailyForecasts;
    const currentDay = JSON.parse(JSON.stringify(forecast[0])).Day.IconPhrase;
    //console.log(currentDay);
    return currentDay;
}

function myWeather() {
    // Create a request variable and assign a new XMLHttpRequest object to it.
    /*
    getLocation("cityName").then(
        function(value) {document.getElementById("weather").innerHTML = value}
    )
    */
    //document.getElementById("weather").innerHTML = JSON.parse(JSON.stringify(JSON.parse('{"Daily": [{"bruh":"lol", "bruh2":"lol2", "realbruh":{"a":"fak","b":"rel"}}]}').Daily[0])).realbruh.a;
    //return;
    document.getElementById("weatherDisplay").classList.add("show")
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(usePosition, showError);
      } else {
        document.getElementById("weatherDisplay").innerHTML = "Geolocation is not supported by this browser.";
      }
}

function usePosition(gPos) {
  var display = "";
  getCityFromCoord(gPos).then(function(city) {
    getWeatherFromCoord(gPos).then(function(weather) {
      document.getElementById("weatherDisplay").innerHTML = display + "Your City: " + city + "<br>"+  "Current Weather: " + weather;
      document.getElementById("weatherDisplay").classList.add("result");
      document.getElementById("weatherDisplay").classList.remove("pending")
    })
  }
  )
  
  ;
}

function showError(error) {
    switch(error.code) {
      case error.PERMISSION_DENIED:
        document.getElementById("weatherDisplay").innerHTML = "User denied the request for Geolocation."
        break;
      case error.POSITION_UNAVAILABLE:
        document.getElementById("weatherDisplay").innerHTML = "Location information is unavailable."
        break;
      case error.TIMEOUT:
        document.getElementById("weatherDisplay").innerHTML = "The request to get user location timed out."
        break;
      case error.UNKNOWN_ERROR:
        document.getElementById("weatherDisplay").innerHTML = "An unknown error occurred."
        break;
    }
}

function refreshResults(value){
  document.getElementById(value).classList.remove("showQuery");
  document.getElementById(value).classList.remove("error");
}