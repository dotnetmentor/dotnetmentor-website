'use strict';

var tileUrl = 'https://api.mapbox.com/v4/mapbox.high-contrast/{z}/{x}/{y}' + (L.Browser.retina ? '@2x' : '') +'.png',
    token = 'pk.eyJ1IjoiZG90bmV0bWVudG9yIiwiYSI6ImNpc2ZxaDFxODAwMzgyc282YnBvY2R0Y3YifQ.DsdwjEhSDSgNUHLdPQf9cw',
    popupContent =
        '<h3>Dotnet Mentor</h3><br>' +
        'Första Långgatan 22<br>' +
        '413 28 Göteborg<br>' +
        'Sweden',
    loc = L.latLng(57.69970, 11.94698),
    map = L.map('map', { scrollWheelZoom: false }).setView(loc, 16),
    insideMap = false,
    scrollWheelTimer;

L.tileLayer(tileUrl + '?access_token=' + token).addTo(map);
L.marker(loc)
    .addTo(map)
    .bindPopup(popupContent)
    .openPopup();

// Tricks to normally disable scroll wheel, but
// enable it once the user hovers for a bit over the map.
map
    .on('mouseover', function() {
        insideMap = true;
        scrollWheelTimer = setTimeout(function() {
            map.scrollWheelZoom.enable()
        }, 1000);
    })
    .on('mouseout', function() {
        insideMap = false;
        clearTimeout(scrollWheelTimer);
        map.scrollWheelZoom.disable();
    });
document.addEventListener('scroll', function() {
    if (insideMap) {
        clearTimeout(scrollWheelTimer);
        scrollWheelTimer = setTimeout(function() {
            map.scrollWheelZoom.enable()
        }, 1000);
    }
});
