'use strict';

var tileUrl = 'https://api.mapbox.com/v4/mapbox.high-contrast/{z}/{x}/{y}' + (L.Browser.retina ? '@2x' : '') +'.png',
    token = 'pk.eyJ1IjoiZG90bmV0bWVudG9yIiwiYSI6ImNpc2ZxaDFxODAwMzgyc282YnBvY2R0Y3YifQ.DsdwjEhSDSgNUHLdPQf9cw',
    popupText =
        '<h3>Dotnet Mentor</h3><br>' +
        '<address>Första Långgatan 22<br>' +
        '413 28 Göteborg<br>' +
        'Sweden</address>',
    loc = L.latLng(57.699629, 11.947388),
    map = L.map('map', { scrollWheelZoom: false }).setView(loc, 16),
    insideMap = false,
    popupContent = L.DomUtil.create('div'),
    findHereBtn = L.DomUtil.create('button'),
    scrollWheelTimer;

findHereBtn.setAttribute('type', 'button');
findHereBtn.innerHTML = 'Hitta hit';

popupContent.innerHTML = popupText;
popupContent.appendChild(findHereBtn);

L.tileLayer(tileUrl + '?access_token=' + token, {
    attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
var marker = L.marker(loc)
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

L.DomEvent.on(document, 'scroll', function() {
    if (insideMap) {
        clearTimeout(scrollWheelTimer);
        scrollWheelTimer = setTimeout(function() {
            map.scrollWheelZoom.enable()
        }, 1000);
    }
});

L.DomEvent.on(findHereBtn, 'click', function() {
    map.closePopup();
    map.removeLayer(marker);

    map.fitBounds = function(bounds, options) {
        L.Map.prototype.fitBounds.call(map, bounds, L.extend(options || {}, {
            paddingBottomRight: [320, 0]
        }))
    };

    var waypointMarkers = [],
        geocoders = [],
        routeCalculated = false,
        geocoder = L.Control.Geocoder.mapzen('search-5eeP56o'),
        createGeocoder = function(i, wp) {
            var content = L.DomUtil.create('div'),
                header = L.DomUtil.create('h3', '', content),
                input = geocoders[i] = L.DomUtil.create('input', '', content),
                help = L.DomUtil.create('p', '', content);

            header.innerHTML = 'Hitta till Dotnet Mentor';
            help.innerHTML = 'Skriv adress eller dra markören på kartan';

            input.setAttribute('placeholder', i === 0 ? 'Starta från...' : 'Åk via...');
            input.value = wp.name || '';
            new L.Routing.Autocomplete(input, function(r) {
                    routingControl.spliceWaypoints(i, 1, {latLng: r.center, name: input.value});
                }, null, {
                resultFn: geocoder.geocode,
                resultContext: geocoder,
                autocompleteFn: geocoder.suggest,
                autocompleteContext: geocoder
            });

            return content;
        },
        routingControl = L.Routing.control({
            waypoints: [loc, loc],
            router: L.Routing.mapbox(token),
            createMarker: function(i, wp, nWps) {
                var marker = waypointMarkers[i] = L.marker(wp.latLng, {
                    draggable: i < nWps - 1,
                    icon: L.icon.glyph({ glyph: String.fromCharCode(65 + i) }),
                    zIndexOffset: 1000 - i
                });

                if (i == nWps - 1) {
                    marker.bindPopup(popupText);
                } else {
                    marker.bindPopup(createGeocoder(i, wp));
                }

                return marker;
            },
            // Don't snap to initial (bogus route)
            fitSelectedRoutes: false,
            language: 'sv',
            routeWhileDragging: true
        });

    routingControl.addTo(map);
    waypointMarkers[0].openPopup();
    geocoders[0].focus();

    routingControl.on('routeselected', function() {
        var container = document.querySelector('.leaflet-routing-container');

        routingControl.options.fitSelectedRoutes = true;
        // Hide the itinerary until the user has changed the route
        if (!routeCalculated) {
            container.style.display = 'none';
        } else {
            container.style.display = null;
        }

        routeCalculated = true;
    });
});
