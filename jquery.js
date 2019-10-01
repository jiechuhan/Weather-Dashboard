var APIkey = "d97e4b2c53609f312dd3fa0083204a18"
let allTheData = {
    cities: []
}

function renderCurrentWeather(currentWeather) {
    var temp = (parseInt(currentWeather.main.temp) - 273.15) * 1.80 + 32;
    $(".temperature").html("Temperature: " + temp.toFixed(2) + " &#x2109");
    $(".humidity").text("Humidity: " + currentWeather.main.humidity + "%");
    $(".wind").text("Wind Speed: " + currentWeather.wind.speed + " MPH");

}

function renderUvIndex(uvIndex) {
    var uvspan = $("<span>").text(" " + uvIndex);
    uvspan.addClass("bg-danger p-2 ml-2 text-light");
    $(".uv").html("UV Index: ");
    $(".uv").append(uvspan);

}

function renderForecastWeather(responses) {
    // add date
    var date = responses.list[0].dt_txt.split(" ")[0];
    console.log(date)
    let change = date.split("-");
    let year = change.shift();
    change.push(year);
    let result = change.join("/");

    //add icon
    var icon = responses.list[0].weather[0].icon;
    var iconLink = $("<img>");
    var iconimg = iconLink.attr("src", "https://openweathermap.org/img/w/" + icon + ".png");
    console.log(iconimg);
    var cityname = $("<h3>").text(responses.city.name + " (" + result + ")");
    cityname.append(iconimg);
    $(".city").empty().append(cityname);


    // add info to 5 day cards
    var length = responses.list.length;
    let dayNumber = 1;

    try {
        for (let i = 1; i < length; i++) {
            var dateT = responses.list[i].dt_txt.split(" ")[1];
            if (dateT === "03:00:00") {
                var dateF = responses.list[i].dt_txt.split(" ")[0];
                console.log(i, dateT, dateF);
                let changeF = dateF.split("-");
                let yearF = changeF.shift();
                changeF.push(yearF);
                let resultF = changeF.join("/");

                $("#" + dayNumber + "d").text(resultF);

                var iconF = responses.list[i].weather[0].icon;
                var iconLinkF = $("<img>");
                var iconimgF = iconLinkF.attr("src", "https://openweathermap.org/img/w/" + iconF + ".png");
                $("#" + dayNumber + "d").append(iconimgF);

                var temp = responses.list[i].main.temp;
                var tempF = (parseInt(temp) - 273.15) * 1.80 + 32;
                $("#" + dayNumber + "t").html("Temp: " + tempF.toFixed(2) + " &#x2109");

                var hum = responses.list[i].main.humidity;
                $("#" + dayNumber + "h").text("Humidity: " + hum + "%");

                dayNumber++;
            };
        };

    } catch (error) {
        debugger;
    }

}

function renderCities(cities) {
    if (cities && cities.length > 0) {
        cities.forEach(function (city) {
            city.toLowerCase().replace(/\b[a-z]/g, function (letter) {
                return letter.toUpperCase();
            });
            var addCity = $("<button>").text(city);
            addCity.attr("class", "cityName btn bg-light text-dark text-left");
            $(".cityCard").prepend(addCity);
        });
    }
}
function renderEverything() {
    renderCurrentWeather(allTheData.currentWeather);
    renderUvIndex(allTheData.uvIndex);
    renderForecastWeather(allTheData.forecast);
    renderCities(allTheData.cities);
}

function getCurrentWeather(city) {
    var queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIkey}`;
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        console.log(response);
        allTheData.currentWeather = response;

        var lat = response.coord.lat;
        var lon = response.coord.lon;
        var uvIndex = `http://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${APIkey}`;

        renderCurrentWeather(allTheData.currentWeather);
        // add UV Index
        $.ajax({
            url: uvIndex,
            method: "GET"
        }).then(function (responsed) {
            console.log(responsed);
            allTheData.uvIndex = responsed.value;
            localStorage.setItem('weatherData', JSON.stringify(allTheData));
            renderUvIndex(responsed.value);

        })
    })
}

function getForecastWeather(city) {
    var fiveDayURL = `http://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${APIkey}`;
    $.ajax({
        url: fiveDayURL,
        method: "GET"
    }).then(function (responses) {
        console.log(responses);
        allTheData.forecast = responses;
        localStorage.setItem('weatherData', JSON.stringify(allTheData));

        renderForecastWeather(allTheData.forecast);
    });
}


$(document).ready(function () {
    let temp = localStorage.getItem('weatherData');
    try {
        if (temp) {
            allTheData = JSON.parse(temp);
            renderEverything();
        }

    } catch (error) {
        debugger;
    }
    $(".btn").on("click", function () {

        // show today's info
        var city = $("#search").val();
        allTheData.cities.push(city);
        if (allTheData.cities.length > 5) {
            allTheData.cities.shift();
        }
        console.log(city);
        getCurrentWeather(city)

        // show 5 days forcast
        getForecastWeather(city)

        // add city to history
        // renderCities(city)
        city.toLowerCase().replace(/\b[a-z]/g, function (letter) {
            return letter.toUpperCase();
        });
        var addCity = $("<button>").text(city);
        addCity.attr("class", "cityName btn bg-light text-dark text-left");
        $(".cityCard").prepend(addCity);


    });

    $(".cityCard").on("click", '.cityName', function () {
        let clicked = $(this).text();
        console.log(clicked);
        getCurrentWeather(clicked)
        getForecastWeather(clicked)

        // renderEverything(allTheData);

    })

})