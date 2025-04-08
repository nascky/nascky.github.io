const apiKey = 'PRIEHUPQT6HW3EKC22I2';
let allLocalEvents = [];

document.addEventListener('DOMContentLoaded', () => {
    const storedEvents = window.localStorage.getItem('organizerEvents');
    if (storedEvents) {
        allLocalEvents = JSON.parse(storedEvents);
    }
});

function searchEvents() {
    const eventName = document.getElementById('eventName').value.toLowerCase();
    const eventLocation = document.getElementById('eventLocation').value.toLowerCase();
    
    if (allLocalEvents.length > 0) {
        const filteredEvents = allLocalEvents.filter(event => 
            (eventName ? event.name.text.toLowerCase().includes(eventName) : true) &&
            (eventLocation ? (event.venue?.name?.toLowerCase().includes(eventLocation) || event.venue?.address?.localized_address_display?.toLowerCase().includes(eventLocation)) : true)
        );
        displayEvents(filteredEvents);
        return;
    }
    
    document.getElementById('eventResults').innerHTML = '<p>No events found in local storage.</p>';
}

function displayEvents(events) {
    const eventContainer = document.getElementById('eventResults');
    eventContainer.innerHTML = '';

    if (!events || events.length === 0) {
        eventContainer.innerHTML = '<p>No events found.</p>';
        return;
    }

    events.forEach(event => {
        const eventCard = document.createElement('div');
        eventCard.classList.add('event-card');
        eventCard.innerHTML = `
            <h3>${event.name.text}</h3>
            <p>${event.description.text ? event.description.text.substring(0, 100) + '...' : 'No description available'}</p>
            <p><strong>Date:</strong> ${new Date(event.start.local).toLocaleString()}</p>
            <a href="${event.url}" target="_blank">View Event</a>
        `;
        eventContainer.appendChild(eventCard);
    });
}