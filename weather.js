const key = "qTfhxiGQiKXsEctMxGjBbGwX5cJZMABc";
const coord = "43.8106064,-79.3658743";
var searchResults = [];
var boxes = ["query1", "query2", "query3", "query4", "query5"];

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
  searchLocation(document.getElementById('cityInput').value).then(function(cityList) {
  for (let i = 0; i < cityList.cities.length; i++){
      searchResults.push(cityList.cities[i] + ", " + cityList.states[i] + ", " + cityList.countries[i]);
    }
    displayResults(0);
  })
  
  return;
}

function displayResults(value){
  boxes.forEach(refreshResults);
  // Side cases
  var offset = 1;
  if(searchResults.length == 0){
    document.getElementById(boxes[0]).innerHTML = "No results found";
    document.getElementById(boxes[0]).classList.add("error");
    return;
  }
  if (value == 0){
    document.getElementById(boxes[0]).innerHTML = searchResults[0];
    document.getElementById(boxes[0]).classList.add("showQuery");
    offset = 0;
    value += 1;
  }
  
  
  for(i = value; i < searchResults.length; i++){
    var boxIndex = i - value + offset;
    if (boxIndex >= boxes.length){
      document.getElementById(boxes[boxes.length - 1]).innerHTML = "...and " + (searchResults.length - i) + " more results";
      break;
    }
    document.getElementById(boxes[boxIndex]).innerHTML = searchResults[i];
    document.getElementById(boxes[boxIndex]).classList.add("showQuery");
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

async function getWeather(id){
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