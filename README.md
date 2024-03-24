# weatherSearch
Finding out what the weather is using Accuweather API!

# General
The application connects to the Accuweather API at http://dataservice.accuweather.com to obtain weather and location info

The search function uses the Accuweather autocomplete search, returning the 10 most relevant results. Selecting a result will request a 1 day forecast from the API with the location key.

# Packaging
Using Electron Forge, the package.json script is automatically created and the application can be built with `npm run make`. An executable file will be created in the output folder, ready to be run.

index.html is also operable by itself as a standalone webpage, however through Electron it becomes portable and easy to distribute.
