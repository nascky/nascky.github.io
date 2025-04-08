const hereApiKey = 'ZbwZeZbOjDNYb_kOk5ECz78o3osPeusgBakDHkP3ykk';

function initMap() {
    // Get the user location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(onLocationFound, onError);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function onLocationFound(position) {
    // Show user location
    let loc = document.getElementById("location");
    const userLat = position.coords.latitude;
    const userLng = position.coords.longitude;
    loc.innerHTML = "Latitude: " + userLat + 
                    "<br>Longitude: " + userLng; 

    var platform = new H.service.Platform({
        apikey: hereApiKey
    });

    var defaultLayers = platform.createDefaultLayers();

    // Initialize map centered on the user location
    var map = new H.Map(
        document.getElementById('map'),
        defaultLayers.vector.normal.map,
        {
            center: { lat: userLat, lng: userLng },
            zoom: 12,
            pixelRatio: window.devicePixelRatio || 1,
        }
    );

    var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
    var ui = H.ui.UI.createDefault(map, defaultLayers);

    // Fetch events based on the user's location
    fetchEvents(userLat, userLng, map, platform);
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

async function fetchEvents(userLat, userLng, map, platform) {
    const ticketmasterApiUrl = 'https://app.ticketmaster.com/discovery/v2/events.json';
    const apiKey = '3SzSUMQvuPOyTVlGKhlV5ATZS7UNY7bO';
    const radius = 100;

    try {
        const response = await fetch(`${ticketmasterApiUrl}?apikey=${apiKey}&latlong=${userLat},${userLng}&radius=${radius}&size=35`);
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log(data);
        const events = data._embedded.events;
        const eventContainer = document.querySelector('#events');
        eventContainer.innerHTML = ""; // Clear previous content

        if (events && events.length > 0) {
            events.forEach(event => {
                const venue = event._embedded.venues[0];
                const venueName = venue.name;
                const venueLat = venue.location.latitude;
                const venueLng = venue.location.longitude;

                // Display event in styled card
                eventContainer.innerHTML += `
                    <div style="border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); padding: 15px; margin-bottom: 20px; background: #fff; max-width: 600px;">
                        <h2 style="margin: 0 0 10px 0; color: #333;">${event.name}</h2>
                        ${event.images && event.images.length ? `<img src="${event.images[0].url}" alt="${event.name}" style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 10px;">` : ''}
                        <p style="margin: 5px 0;"><strong>Venue:</strong> ${venueName}</p>
                        <a href="${event.url}" target="_blank" style="display: inline-block; margin-top: 10px; padding: 10px 15px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Buy Tickets</a>
                    </div>
                `;

                // Create marker for each event
                var marker = new H.map.Marker({ lat: venueLat, lng: venueLng });
                map.addObject(marker);

                // Add click event for each marker
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
