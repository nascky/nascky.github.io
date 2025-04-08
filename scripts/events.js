const hereApiKey = 'ZbwZeZbOjDNYb_kOk5ECz78o3osPeusgBakDHkP3ykk';
let map;

function initMap() {
    // Get the user location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(onLocationFound, onError);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function onLocationFound(position) {
    //Show user location
    let loc = document.getElementById("location");
    const userLat = position.coords.latitude;
    const userLng = position.coords.longitude;
    loc.innerHTML = "Latitude: " + userLat + 
                    "<br>Longitude: " + userLng; 

    const platform = new H.service.Platform({
        apikey: hereApiKey
    });

    const defaultLayers = platform.createDefaultLayers();

    // Initialize map centered on the user location
    map = new H.Map(
        document.getElementById('map'),
        defaultLayers.vector.normal.map,
        {
            center: { lat: userLat, lng: userLng },
            zoom: 12
        }
    );

    // Fetch events based on the user's location
    fetchEvents(userLat, userLng);
}

function onError(error) {
    alert("Error getting location: " + error.message);
    switch(error.code) {
        case error.PERMISSION_DENIED:
            x.innerHTML = "User denied the request for Geolocation."
            break;
        case error.POSITION_UNAVAILABLE:
            x.innerHTML = "Location information is unavailable."
            break;
        case error.TIMEOUT:
            x.innerHTML = "The request to get user location timed out."
            break;
        case error.UNKNOWN_ERROR:
            x.innerHTML = "An unknown error occurred."
            break;
    }
}

async function fetchEvents(userLat, userLng) {
    const ticketmasterApiUrl = 'https://app.ticketmaster.com/discovery/v2/events.json';
    const apiKey = '3SzSUMQvuPOyTVlGKhlV5ATZS7UNY7bO';
    const radius = 100;

    try {
        const response = await fetch(`${ticketmasterApiUrl}?apikey=${apiKey}&latlong=${userLat},${userLng}&radius=${radius}&size=10`);
        
        // Check if the response is okay
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        const events = data._embedded.events;

        if (events && events.length > 0) {
            events.forEach(event => {
                const venue = event._embedded.venues[0];
                const venueName = venue.name;
                const venueLat = venue.location.latitude;
                const venueLng = venue.location.longitude;

                //List found events
                document.getElementById("#events").append("<p>"+event.name+"</p>");

                // Create a marker for each event on the map
                const marker = new H.map.Marker({ lat: venueLat, lng: venueLng });
                map.addObject(marker);

                // Add a click event to the marker to show event details
                marker.addEventListener('tap', () => {
                    const infoBubble = new H.ui.InfoBubble(marker.getPosition(), {
                        content: `<div><h3>${venueName}</h3><p>${event.name}</p><a href="${event.url}" target="_blank">Buy Tickets</a></div>`
                    });
                    const ui = H.ui.UI.createDefault(map, platform.createDefaultLayers());
                    ui.addBubble(infoBubble);
                });
            });
        } else {
            alert("No events found near your location.");
        }
    } catch (error) {
        console.error('Error fetching events:', error);
    }
}

// Initialize the map when the page loads
window.onload = initMap;