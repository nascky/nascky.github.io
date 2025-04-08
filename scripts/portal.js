const apiKey = "PRIEHUPQT6HW3EKC22I2";
const eventID = 1128903704369

async function loadEvent() {
    try {
        const url = `https://www.eventbriteapi.com/v3/events/${eventID}/?expand=venue`;
        
        const options = {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        }
        
        const response = await fetch(url, options);
        console.log(response);
        if (!response.ok) {
          throw new Error('Response not okay. Error: ${response.statusText}');
        }
    
        const data = await response.json();
        console.log(data);

        const eventLoc = data.venue;
        console.log(eventLoc);

        const lat = eventLoc.latitude;
        const lon = eventLoc.longitude;
    
        const eventContainer = document.querySelector('#event');
        eventContainer.innerHTML = '';

        eventContainer.innerHTML += 
        'Event Location: ' +
        '<br />' +
        'Latitude: ' +
        lat +
        '<br />' +
        'Longitude: ' +
        lon +
        '<br /> <hr />';
        'Weather: ' +
        lon +
        '<br /> <hr />';
    } catch (error) {
        console.log(error);
      }
}

document.addEventListener('DOMContentLoaded', () => {
    loadEvent();
  });