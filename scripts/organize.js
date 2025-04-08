const apiKey = 'PRIEHUPQT6HW3EKC22I2';
        const organizers = [
            { id: '25384628197', name: 'The Valencia Room' },
            { id: '34884130473', name: 'Marceau Winston' },
            { id: '19733533513', name: 'NEX V$T' },
            { id: '7252662729', name: 'Afro Events' },
            { id: '17571524653', name: 'First to First Entertainment' },
            { id: '38687942063', name: 'The Alchemist Kitchen' },
            { id: '30091033020', name: 'Learn it Life' },
            { id: '71669941173', name: 'Yogix Box' },
            { id: '17901778359', name: 'The Stretch Place' },
            { id: '78835521563', name: 'Bussiness Powerhub' }
        ];

        let allEvents = [];
        let currentFilter = 'all';
        let organizerStats = {};

        document.addEventListener('DOMContentLoaded', function() {
            fetchAllOrganizerEvents(); // Call the function directly on page load
        });

        function fetchAllOrganizerEvents() {
            document.getElementById('eventResults').innerHTML = '<div class="loading">Loading events from 10 organizers...</div>';
            document.getElementById('statsDisplay').innerHTML = '';
            document.getElementById('organizerFilter').innerHTML = ''; // Clear previous filter

            // Clear previous data
            allEvents = [];
            organizerStats = {};

            // Initialize stats
            organizers.forEach(org => {
                organizerStats[org.id] = {
                    name: org.name,
                    count: 0,
                    success: false
                };
            });

            // Create array of fetch promises
            const fetchPromises = organizers.map(organizer => {
                const url = `https://www.eventbriteapi.com/v3/organizers/${organizer.id}/events/?expand=venue,logo&token=${apiKey}`;
                return fetch(url)
                    .then(response => {
                        if (!response.ok) throw new Error(`Failed to fetch events for ${organizer.name}`);
                        return response.json();
                    })
                    .then(data => {
                        if (data.events && data.events.length > 0) {
                            // Add organizer name to each event
                            const eventsWithOrganizer = data.events.map(event => ({
                                ...event,
                                organizerName: organizer.name,
                                organizerId: organizer.id
                            }));
                            allEvents.push(...eventsWithOrganizer);
                            organizerStats[organizer.id].count = data.events.length;
                            organizerStats[organizer.id].success = true;
                        }
                        return data.events ? data.events.length : 0;
                    })
                    .catch(error => {
                        console.error(`Error fetching events for ${organizer.name}:`, error);
                        organizerStats[organizer.id].error = error.message;
                        return 0;
                    });
            });

            // Wait for all fetches to complete
            Promise.all(fetchPromises)
                .then(results => {
                    const totalEvents = results.reduce((sum, count) => sum + count, 0);

                    // Update stats display
                    updateStatsDisplay(totalEvents);

                    if (totalEvents === 0) {
                        document.getElementById('eventResults').innerHTML = '<div class="error">No events found across any organizers.</div>';
                        return;
                    }

                    // Sort events by date
                    allEvents.sort((a, b) => new Date(a.start.local) - new Date(b.start.local));

                    localStorage.setItem('organizerEvents', JSON.stringify(allEvents));

                    displayEvents(allEvents);
                    setupOrganizerFilter();
                })
                .catch(error => {
                    console.error('Error fetching events:', error);
                    document.getElementById('eventResults').innerHTML = '<div class="error">Error loading events. Please try again.</div>';
                });
        }

        function updateStatsDisplay(totalEvents) {
            const successfulOrgs = organizers.filter(org => organizerStats[org.id].success);
            const statsHTML = `
                <div><strong>${totalEvents}</strong> events loaded from <strong>${successfulOrgs.length}</strong> of ${organizers.length} organizers</div>
                ${successfulOrgs.length < organizers.length ?
                    `<div style="color:var(--secondary-color); margin-top:8px;">
                        <i class="fas fa-exclamation-circle"></i> Some organizers failed to load (see console for details)
                    </div>` : ''}
            `;
            document.getElementById('statsDisplay').innerHTML = statsHTML;
        }

        function displayEvents(events) {
            const eventContainer = document.getElementById('eventResults');
            eventContainer.innerHTML = '';

            if (!events || events.length === 0) {
                eventContainer.innerHTML = '<div class="error">No events found matching your filter.</div>';
                return;
            }

            // Filter events based on current selection
            const filteredEvents = currentFilter === 'all'
                ? events
                : events.filter(event => event.organizerId === currentFilter);

            filteredEvents.forEach(event => {
                const eventElement = document.createElement('div');
                eventElement.className = 'event-card';

                // Format the date
                const eventDate = new Date(event.start.local);
                const timeString = eventDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                const dayString = eventDate.toLocaleDateString([], {weekday: 'short'});
                const dateString = eventDate.toLocaleDateString([], {month: 'short', day: 'numeric', year: 'numeric'});

                // Get image URL (logo or placeholder)
                const imageUrl = event.logo?.url || 'https://via.placeholder.com/400x200?text=No+Image';

                eventElement.innerHTML = `
                    <div class="event-image-container">
                        <img class="event-image" src="${imageUrl}" alt="${event.name.text}">
                    </div>
                    <div class="event-content">
                        <div class="event-title">${event.name.text}</div>
                        <div class="event-organizer">${event.organizerName}</div>

                        <div class="event-meta">
                            <div class="event-meta-item">
                                <i class="far fa-calendar-alt"></i>
                                ${dayString}, ${dateString} • ${timeString}
                            </div>
                            <div class="event-meta-item">
                                <i class="fas fa-map-marker-alt"></i>
                                ${event.venue?.name || 'Location not specified'}
                            </div>
                        </div>

                        <div class="event-price">${event.is_free ? 'FREE' : 'Tickets from $0.00'}</div>
                    </div>
                `;
                eventContainer.appendChild(eventElement);
            });
        }

        function setupOrganizerFilter() {
            const filterContainer = document.getElementById('organizerFilter');
            filterContainer.innerHTML = '';

            // Add 'All' filter button
            const allButton = document.createElement('div');
            allButton.className = `filter-btn ${currentFilter === 'all' ? 'active' : ''}`;
            allButton.textContent = 'All Organizers';
            allButton.onclick = () => {
                currentFilter = 'all';
                displayEvents(allEvents);
                document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                allButton.classList.add('active');
            };
            filterContainer.appendChild(allButton);

            // Add buttons for each organizer (only those with events)
            organizers.forEach(organizer => {
                if (organizerStats[organizer.id]?.count > 0) {
                    const btn = document.createElement('div');
                    btn.className = `filter-btn ${currentFilter === organizer.id ? 'active' : ''}`;
                    btn.textContent = `${organizer.name} (${organizerStats[organizer.id].count})`;
                    btn.onclick = () => {
                        currentFilter = organizer.id;
                        displayEvents(allEvents);
                        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                        btn.classList.add('active');
                    };
                    filterContainer.appendChild(btn);
                }
            });
        }