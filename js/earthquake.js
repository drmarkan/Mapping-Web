// Create map
var map = L.map("map", {
    center: [40.7, -94.5],
    zoom: 4,
    layers: baseMaps

});


var apiKey = "access_token=pk.eyJ1IjoiZHJtYXJrYW4iLCJhIjoiY2pvcWtkbmo2MDV4czN3bW9pZ2xtZjMwcCJ9.X2fo0Z4BCQyFmYA-6HjN8A";


// Outdoors - default map
var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" + apiKey,
    { id: 'map' });

// Satellite map
var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?" + apiKey,
    { id: 'map' });

// Grayscale map
var grayscale = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" + apiKey,
    { id: 'map' });

var baseMaps = {
    "Outdoors": outdoors,
    "Satellite": satellite,
    "Grayscale": grayscale
};

grayscale.addTo(map);

// Create the layers for the two different sets of data.
var tectonicplates = new L.LayerGroup();
var earthquakes = new L.LayerGroup();

// Define an object that contains all of the overlays.
var overlays = {
    "Tectonic Plates": tectonicplates,
    "All Earthquakes": earthquakes
};

// earthquakes all week data
var link = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
var plates_link = "json/plates.json"
var controlLayers = L.control.layers(baseMaps, overlays).addTo(map);

// Create a sytle function for the circles
function styleInfo(feature) {
    return {
        fillOpacity: 0.80,
        color: getColor(feature.properties.mag),
        radius: getRadius(feature.properties.mag),
        stroke: true,
        weight: 0.5
    };
};

function getColor(magnitude) {
    switch (true) {
        case magnitude > 5:
            return "#DC143C"; // crimson
        case magnitude > 4:
            return "#FFFF00"; // yellow
        case magnitude > 3:
            return "#00CED1"; // darkturquoise
        case magnitude > 2:
            return "#9400D3"; // darkviolet
        case magnitude > 1:
            return "#1E90FF"; // dodgerblue
        default:
            return "#B0E0E6"; // powderblue
    }
};

// Radius
function getRadius(magnitude) {
    switch (true) {
        case magnitude > 5:
            return 20;
        case magnitude > 4:
            return 13;
        case magnitude > 3:
            return 10;
        case magnitude > 2:
            return 7;
        case magnitude > 1:
            return 6;
        default:
            return 5;
    }
};

//create a function: populateInfo to add data
function populateInfo(feature, layer) {
    layer.bindPopup("<h1 class='infoHeader'>Weekly Earthquake Data</h1> \
    <p class='description'>" + "Location: " + feature.properties.place + "</p>\
    <p class='description'>" + "Magnitude: " + feature.properties.mag + "</p>");

};

// function for plate color
function colorPlates(feature) {
    return {
        color: "#FFA500",
        fillOpacity: 0.05
    };
};

// function for plate popup
function popPlate(feature, layer) {
    layer.bindPopup("<h1 class='infoHeader'>Tectonic Plate:</h1> \
<p class='plate'>" + feature.properties.PlateName + "</p>");

};

// Here we add a GeoJSON layer to the map once the file is loaded.
d3.json(link, function (data) {
    var earthquakeLayer = L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng);
        },
        style: styleInfo,
        onEachFeature: populateInfo,
    }).addTo(earthquakes);
});

// add plate layer
d3.json(plates_link, function (data) {
    var plateLayer = L.geoJson(data, {
        style: colorPlates,
        onEachFeature: popPlate,
    }).addTo(tectonicplates);

    // Setting up the legend
    var legend = L.control({ position: 'bottomright' });
    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 1, 2, 3, 4, 5],
            labels = [];

        // loop through density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }

        return div;
    };

    legend.addTo(map);

});

