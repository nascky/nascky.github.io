document.addEventListener('DOMContentLoaded', async () => {
  const tableBody = document.querySelector('#ordersTable tbody');
  const totalOrdersEl = document.getElementById('totalOrders');
  const totalRevenueEl = document.getElementById('totalRevenue');
  const refreshBtn = document.getElementById('refreshBtn');
  const statusFilter = document.getElementById('statusFilter');
  
  refreshBtn.addEventListener('click', fetchAndDisplayEvents);
  statusFilter.addEventListener('change', fetchAndDisplayEvents);

  await fetchAndDisplayEvents();

  async function fetchAndDisplayEvents() {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center;">
          <div class="loader"></div>
          <p>Loading events...</p>
        </td>
      </tr>
    `;

    try {
      const response = await fetch('ticketSold.json');
      if (!response.ok) throw new Error('Failed to fetch events');

      const data = await response.json();
      const events = data.events;

      // Filter events based on selected status
      const filteredEvents = filterEventsByStatus(events);

      // Sort the events by status (pending first, then completed)
      const statusOrder = ['Pending', 'Completed'];
      filteredEvents.sort((a, b) => {
        return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
      });

      updateDashboardStats(filteredEvents);
      renderEventsTable(filteredEvents);
    } catch (error) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; color: #e74c3c;">
            Error loading events: ${error.message}
          </td>
        </tr>
      `;
      console.error('Error:', error);
    }
  }

  function filterEventsByStatus(events) {
    const selectedStatus = statusFilter.value;
    if (selectedStatus === 'all') return events;
    return events.filter(event => event.status === selectedStatus);
  }

  function updateDashboardStats(events) {
    totalOrdersEl.textContent = events.length;

    const totalRevenue = events.reduce((sum, event) => {
      return sum + parseFloat(event.totalPrice);
    }, 0);

    totalRevenueEl.textContent = `$${totalRevenue.toFixed(2)}`;

    // Update stats for pending and completed orders
    const pendingOrders = events.filter(event => event.status === 'Pending').length;
    const completedOrders = events.filter(event => event.status === 'Completed').length;
    
    document.getElementById('pendingOrders').textContent = pendingOrders;
    document.getElementById('completedOrders').textContent = completedOrders;
  }

  function renderEventsTable(events) {
    if (events.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center;">No events found</td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = '';

    events.forEach(event => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${event.id}</td>
        <td>${event.name}</td>
        <td>${event.time}</td>
        <td>${event.place}</td>
        <td>${event.ticketType}</td>
        <td>${event.quantity}</td>
        <td>${event.totalPrice}</td>
        <td>${event.status}</td>
      `;
      tableBody.appendChild(row);
    });
  }
});