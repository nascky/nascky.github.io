document.addEventListener("DOMContentLoaded", function () {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
        alert("You must be signed in to manage events.");
        window.location.href = "signin.html";
        return;
    }

    function loadEvents() {
        let events = JSON.parse(localStorage.getItem('events')) || [];
        let myEvents = events.filter(event => event.creator === currentUser.email);
        displayEvents(myEvents);
    }

    function displayEvents(events) {
        let eventsContainer = document.getElementById("eventsContainer");
        eventsContainer.innerHTML = "";

        events.forEach(event => {
            let eventElement = document.createElement("div");
            eventElement.classList.add("event-card");
            eventElement.dataset.id = event.id;

            eventElement.innerHTML = `
                <img src="${event.image}" alt="${event.name}" class="event-image">
                <h3>${event.name}</h3>
                <p><strong>Time:</strong> ${event.time}</p>
                <p><strong>Location:</strong> ${event.place}</p>
                <p><strong>Description:</strong> ${event.description}</p>
                <p><strong>Ticket Type:</strong> ${event.ticketType}</p>
                <div class="event-actions">
                    <button class="edit-btn" data-id="${event.id}">Edit</button>
                    <button class="delete-btn" data-id="${event.id}">Delete</button>
                </div>
            `;

            eventsContainer.appendChild(eventElement);
        });

        addButtonEventListeners();
    }

    function addButtonEventListeners() {
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', function () {
                const eventId = this.getAttribute('data-id');
                editEvent(eventId);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function () {
                const eventId = this.getAttribute('data-id');
                deleteEvent(eventId);
            });
        });
    }

    function editEvent(eventId) {
        let events = JSON.parse(localStorage.getItem('events')) || [];
        let event = events.find(event => event.id === eventId);

        if (event) {
            document.getElementById('eventName').value = event.name;
            document.getElementById('eventTime').value = formatDateTimeForInput(event.time);
            document.getElementById('eventPlace').value = event.place;
            document.getElementById('eventDescription').value = event.description;
            document.getElementById('ticketType').value = event.ticketType;

            document.getElementById('eventForm').dataset.editing = eventId;
            document.querySelector('#eventForm button[type="submit"]').textContent = 'Update Event';
            const cancelButton = document.getElementById('cancelEdit');
            if (cancelButton) cancelButton.style.display = 'inline-block';
            document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
        }
    }

    function formatDateTimeForInput(dateTimeString) {
        if (dateTimeString.includes('T')) return dateTimeString;
        try {
            const date = new Date(dateTimeString);
            return date.toISOString().slice(0, 16);
        } catch (e) {
            console.error("Error formatting date:", e);
            return dateTimeString;
        }
    }

    function deleteEvent(eventId) {
        if (confirm('Are you sure you want to delete this event?')) {
            let events = JSON.parse(localStorage.getItem('events')) || [];
            let filteredEvents = events.filter(event => event.id !== eventId);
            localStorage.setItem('events', JSON.stringify(filteredEvents));
            loadEvents();
        }
    }

    const eventForm = document.getElementById("eventForm");
    if (eventForm) {
        eventForm.addEventListener("submit", function (e) {
            e.preventDefault();

            let name = document.getElementById("eventName").value;
            let time = document.getElementById("eventTime").value;
            let place = document.getElementById("eventPlace").value;
            let description = document.getElementById("eventDescription").value;
            let ticketType = document.getElementById("ticketType").value;
            let imageInput = document.getElementById("eventImage");
            let image = imageInput.files[0]
                ? URL.createObjectURL(imageInput.files[0])
                : 'images/default-event.png';

            const editingId = eventForm.dataset.editing;
            let events = JSON.parse(localStorage.getItem('events')) || [];

            if (editingId) {
                let existingEvent = events.find(event => event.id === editingId);
                if (existingEvent) {
                    existingEvent.name = name;
                    existingEvent.time = time;
                    existingEvent.place = place;
                    existingEvent.description = description;
                    existingEvent.ticketType = ticketType;
                    if (imageInput.files[0]) {
                        existingEvent.image = image;
                    }
                }

                eventForm.dataset.editing = '';
                document.querySelector('#eventForm button[type="submit"]').textContent = '+ Add Event';
                const cancelButton = document.getElementById('cancelEdit');
                if (cancelButton) cancelButton.style.display = 'none';
            } else {
                let newEvent = {
                    id: Date.now().toString(),
                    name,
                    time,
                    place,
                    description,
                    ticketType,
                    image,
                    creator: currentUser.email
                };
                events.unshift(newEvent); // Add new events at the top
            }

            localStorage.setItem('events', JSON.stringify(events));
            eventForm.reset();
            loadEvents();
        });

        if (!document.getElementById('cancelEdit')) {
            const cancelEditButton = document.createElement('button');
            cancelEditButton.textContent = 'Cancel';
            cancelEditButton.type = 'button';
            cancelEditButton.id = 'cancelEdit';
            cancelEditButton.style.display = 'none';
            cancelEditButton.addEventListener('click', function () {
                eventForm.reset();
                eventForm.dataset.editing = '';
                document.querySelector('#eventForm button[type="submit"]').textContent = '+ Add Event';
                this.style.display = 'none';
            });
            eventForm.appendChild(cancelEditButton);
        }
    }

    // Load events from XML and avoid duplicates
    fetch('events.xml')
        .then(response => response.text())
        .then(str => {
            let parser = new DOMParser();
            let xmlDoc = parser.parseFromString(str, "application/xml");

            let events = xmlDoc.getElementsByTagName("event");
            let eventsArray = [];

            for (let i = 0; i < events.length; i++) {
                let event = events[i];
                let creator = event.getElementsByTagName("creator")[0]?.textContent || "";

                if (creator === currentUser.email) {
                    let eventData = {
                        id: event.getElementsByTagName("id")[0].textContent,
                        name: event.getElementsByTagName("name")[0].textContent,
                        time: event.getElementsByTagName("time")[0].textContent,
                        place: event.getElementsByTagName("place")[0].textContent,
                        description: event.getElementsByTagName("description")[0].textContent,
                        ticketType: event.getElementsByTagName("ticketType")[0].textContent,
                        image: event.getElementsByTagName("image")[0].textContent,
                        creator: creator
                    };

                    eventsArray.push(eventData);
                }
            }

            let existingEvents = JSON.parse(localStorage.getItem('events')) || [];

            // Add only XML events that aren't already in localStorage
            let uniqueNewEvents = eventsArray.filter(newEvent =>
                !existingEvents.some(existing => existing.id === newEvent.id)
            );

            let combined = [...existingEvents, ...uniqueNewEvents];
            localStorage.setItem('events', JSON.stringify(combined));
            loadEvents();
        })
        .catch(error => {
            console.error("Error loading events.xml:", error);
            loadEvents(); // Fallback to only localStorage
        });
});
