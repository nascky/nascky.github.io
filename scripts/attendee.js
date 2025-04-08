document.addEventListener("DOMContentLoaded", function () {
    const eventContainer = document.querySelector(".events");
    const eventbriteToken = "PRIEHUPQT6HW3EKC22I2";

    async function fetchEvent() {
        try {
            const response = await fetch("https://www.eventbriteapi.com/v3/events/1128903704369/?token=PRIEHUPQT6HW3EKC22I2")
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const event = await response.json(); 

       
            eventContainer.innerHTML = ""; 

           
            const eventHTML = `
                <div class="event">
                    <a href="${event.url}" target="_blank">
                        <img src="${event.logo ? event.logo.url : 'images/default.png'}" alt="${event.name.text}">
                    </a>
                    <h2>${event.name.text}</h2>
                    <p>${event.description.text ? event.description.text.substring(0, 100) + "..." : "No description available"}</p>
                    <p><strong>Start:</strong> ${event.start.local}</p>
                    <p><strong>End:</strong> ${event.end.local}</p>
                    <button class="attend" onclick="window.location.href='${event.url}'">Attend</button>
                </div>
            `;

            eventContainer.innerHTML = eventHTML;

        } catch (error) {
            console.error("Error fetching event:", error);
            eventContainer.innerHTML = "<p class='error'>Failed to load event. Please try again later.</p>";
        }
    }

    fetchEvent();
});
