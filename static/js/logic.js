// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {

  console.log(data)
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup that describes the place and time of the earthquake.
  function onEachFeature(features, layer) {
    layer.bindPopup(`<h3>${features.properties.place}</h3><hr><p>${new Date(features.properties.time)}</p>`);
  }

  // Define function for changing color based on magnitude of earthquake
  function changeColor(features) {
    if (features.properties.mag > 7)
    return 'black'
    else if (features.properties.mag > 5)
    return 'red'
    else if (features.properties.mag > 2.5)
    return 'yellow'
    else
    return 'green'
  };

  function changeSize(features) {
    if (features.geometry.coordinates[2] > 100)
    return 0
    else return features.geometry.coordinates[2]
  };
  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function(features, latlng) {
      return L.circleMarker(latlng)
    },
    style: function geojsonMarkerOptions(features) {
      return {
          radius: changeSize(features),
          fillColor: changeColor(features),
          color: '#000',
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
  
      }
    }
  });

  // Send our earthquakes layer to the createMap function/
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Create the base layers.
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create a baseMaps object.
  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  let tectonicplates = new L.LayerGroup()
  // Create an overlay object to hold our overlay.
  let overlayMaps = {
    Earthquakes: earthquakes,
    'Tectonic Plates': tectonicplates
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  let myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [street, earthquakes]
  });

  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Legend
  let legend = L.control({position: 'bottomright'});
  // console.log(geojson.options.limits);
  // console.log(geojson.options.colors);
  legend.onAdd = function (myMap) {

      let div = L.DomUtil.create('div', 'info legend'),
        // grades = geojson.options.limits.map( m => Math.round(m)),
        grades = [0, 2.5, 5, 7 ],
        colors = ['green', 'yellow', 'red', 'black'];

      // loop through our density intervals and generate a label with a colored square for each interval
      for (let i = 0; i < grades.length; i++) {
        div.innerHTML +=
          '<i style="background:' + colors[i] + '"></i> ' +
          grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }

      return div;
      
  };