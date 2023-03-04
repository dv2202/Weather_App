const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");
const userInfoContainer = document.querySelector(".user-info-container");
const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm ]");
const loadingScreen = document.querySelector(".loading-container")
const searchInp = document.querySelector("[data-searchInp]");
const apiErrorContainer = document.querySelector(".api-error-container");
const apiErrorMessage = document.querySelector("[data-apiErrorText]")

let oldTab = userTab;
const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";
oldTab.classList.add("current-tab");

getfromSessionStorage();

function switchTab(newTab){
    if(newTab != oldTab){
        oldTab.classList.remove("current-tab");
        oldTab=newTab;
        oldTab.classList.add("current-tab");

        if(!searchForm.classList.contains("active")){
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        else{
            //main pehle search wale tab pr tha ab your weather tab visible
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            // ab main your weather tab me aagaya hu toh wetaher bhi display karo so lets check local storage first for coordinate 
            getfromSessionStorage();
        }
    } 
}

userTab.addEventListener("click" , ()=> {
    //pass clicked tab as input 
    switchTab(userTab);
});

searchTab.addEventListener("click" , ()=> {
    //pass clicked tab as input 
    switchTab(searchTab);
});

// check if coordinate are already present in storage 
function getfromSessionStorage(){
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates){
        grantAccessContainer.classList.add("active");
    }
    else{
        const coordinates = JSON.parse(localCoordinates);
        fetchUSerWeatherInfo(coordinates);
    }
}

async function fetchUSerWeatherInfo(coordinates){
    const {lat, lon} = coordinates;
    grantAccessContainer.classList.remove("active");
    //make loader visible 
    loadingScreen.classList.add("active");
    // API call 
    try{
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        const data = await res.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");

        renderWeatherInfo(data);
    }
    catch(e){
        loadingScreen.classList.remove('active');
    }
}

function renderWeatherInfo(weatherInfo){
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]")
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    //
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C `;
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity} %`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all} %`;
}
function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
    }
    else{
        
    }
}

function showPosition(position){
    const userCoordinate = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }
    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinate));
    fetchUSerWeatherInfo(userCoordinate)
}

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation); 

const searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit" , (e) =>{
    e.preventDefault();
    let cityName = searchInput.value;
    if(cityName === "")
        return;
    else    
        fetchSearchWeatherInfo(cityName);
})

async function fetchSearchWeatherInfo(city){
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");
    apiErrorContainer.classList.remove("active");
    try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
       console.log(res);
        const data = await res.json();
        if(!data.sys){
            throw data ; 
        }
        // console.log("Search - Api Fetch Data", data);
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(error){
        loadingScreen.classList.remove("active");
        apiErrorContainer.classList.add("active");
        apiErrorMessage.innerText= `${error.message}`;
    }
}