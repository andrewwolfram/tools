window.onload = function(){myBehavior();};

function myBehavior() {
    
    document.getElementById("inject_button").addEventListener("click", function(){injectScript();});

}

function injectScript() {
    
    var site_name = document.getElementById("site_name").value;
    var page_id = document.getElementById("page_id").value;
    var site_country = document.getElementById("site_country").value;
    var site_currency = document.getElementById("site_currency").value;
    var site_language = document.getElementById("site_language").value;
    var display_format = document.getElementById("desktop").checked ? "DESKTOP" : "MOBILE";
    
    var flight = document.getElementById("flight").checked;
    var hotel = document.getElementById("hotel").checked;
    var car = document.getElementById("car").checked;
    var beacon = document.getElementById("beacon").checked;
    var frequency = document.getElementById("frequency").checked;

    if(!site_name.length || !page_id.length) {
        if(!page_id.length) {
            document.getElementById("page_id").style.backgroundColor="#FFE0E0";
            document.getElementById("page_id").focus();
        }
        if(!site_name.length) {
            document.getElementById("site_name").style.backgroundColor="#FFE0E0";
            document.getElementById("site_name").focus();
        }
        return false; 
    }
    

    if(!site_country.length) site_country = "US";
    if(!site_currency.length) site_currency = "USD";
    if(!site_language.length) site_language = "en";

    var beacon_params = 
        '"site_name":' + '"' + site_name + '"' + "," +
        '"page_id":' + '"' + page_id + '"'; 

    var page_params = 
        '"site_name":' + '"' +  site_name + '"' +  "," +
        '"page_id":' +  '"' + page_id + '"' + "," +
        '"site_country":' + '"' + site_country + '"' + "," +
        '"site_currency":' + '"' + site_currency + '"' + "," +
        '"site_language":' + '"' + site_language + '"' + "," +
        '"display_format_type":' + '"' + display_format + '"'; 

    var travel_dates = getTravelDates();

    var generic_params = 
        '"travel_date_start":' + '"' + travel_dates[0] + '"' + "," +
        '"travel_date_end":' + '"' + travel_dates[1] + '"' + "," +
        '"travelers": "2"';

    var flight_params =
        '"trip_type": "roundtrip",' +
        '"flight_origin": "MCO",' +
        '"flight_destination": "LGA"'; 

    var hotel_params =
        '"hotel_city": "Orlando",' +
        '"hotel_country": "US",' +
        '"hotel_state": "FL",' +
        '"hotel_rooms": "1"';

    var car_params = 
        '"car_pickup_location_type": "CITY",' +
        '"car_pickup_city": "Orlando",' +
        '"car_pickup_state": "FL",' +
        '"car_pickup_country": "US",' +
        '"car_dropoff_location_type": "AIRPORT",' +
        '"car_dropoff_airport": "MIA"';

   var frequency_cap_code = "";
   if(frequency) {
      frequency_cap_code=
        '(function() {' + 
           'var script = document.createElement("script");' + 
           'script.innerHTML = "setTimeout(function(){IntentMedia.ExitUnitOpener.options.is_frequency_capped = function() { return false; }; IntentMedia.ExitUnitOpener.is_cross_site_eu_frequency_capped = function() { return false; }; IntentMedia.ExitUnitOpener.opener_is_deactivated = function() { return false; };}, 1000);";' + 
           'document.getElementsByTagName("head")[0].appendChild(script);' +
        '}());';  
   }

   var intent_media_parameters = "";

   if(beacon) {
       intent_media_parameters = '{' + beacon_params + '}';
   } else {
       intent_media_parameters = 
           page_params + ',' +
           generic_params + ',';
       if(flight) intent_media_parameters = intent_media_parameters + flight_params + ','; 
       if(hotel) intent_media_parameters = intent_media_parameters + hotel_params + ','; 
       if(car) intent_media_parameters = intent_media_parameters + car_params + ','; 

       intent_media_parameters = intent_media_parameters.substring(0, intent_media_parameters.length -1);
       intent_media_parameters = '{' + intent_media_parameters + '}';
   }
    
    chrome.tabs.executeScript({
        code:
        'var IntentMediaProperties = ' + "'" + intent_media_parameters + "'" + ';' + 
        '(function() {' + 
                       'var script = document.createElement("script");' + 
                       'script.innerHTML = "var IntentMediaProperties =" + IntentMediaProperties + ";";' + 
                       'document.getElementsByTagName("head")[0].appendChild(script);' +
                    '}());' + 
        '(function() {' + 
           'var script = document.createElement("script");' + 
           'var url = "//a.cdn.intentmedia.net/javascripts/v1/intent_media_core.js";' +
           'script.src = url;' +
           'document.getElementsByTagName("head")[0].appendChild(script);' +
        '}());' + frequency_cap_code 
    });

    window.close();

}

function getTravelDates() {

    var today = new Date();
    var year = today.getFullYear();

    var month = today.getMonth() + 1;
    if(month == 12) {month = 1; year + 1;}
    month + 1;
    if(month < 10) month = "0" + month;

    var travel_date_start = "" + year + month + "15"
    var travel_date_end = "" + year + month + "17";

    return [travel_date_start, travel_date_end];

}
