const xmlString = `
<tickets>
    <ticket>
        <type>EARLY BIRD</type>
        <price>50</price>
        <availability>Limited</availability>
    </ticket>
    <ticket>
        <type>GENERAL</type>
        <price>75</price>
        <availability>Available</availability>
    </ticket>
    <ticket>
        <type>LAST MINUTE</type>
        <price>90</price>
        <availability>Few Left</availability>
    </ticket>
    <ticket>
        <type>VIP</type>
        <price>150</price>
        <availability>Exclusive</availability>
    </ticket>
</tickets>`;

// Parse the XML string into a DOM object 
const parser = new DOMParser();
const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

// Accessing ticket elements
const tickets = xmlDoc.getElementsByTagName('ticket');

for (let i = 0; i < tickets.length; i++) {
  const type = tickets[i].getElementsByTagName('type')[0].textContent;
  const price = tickets[i].getElementsByTagName('price')[0].textContent;
  const availability = tickets[i].getElementsByTagName('availability')[0].textContent;

  console.log(`Ticket ${i + 1}: ${type} - $${price} (${availability})`);
}

// Adding a new ticket
const newTicket = xmlDoc.createElement('ticket');

const newType = xmlDoc.createElement('type');
newType.textContent = 'STUDENT PASS';
newTicket.appendChild(newType);

const newPrice = xmlDoc.createElement('price');
newPrice.textContent = '40';
newTicket.appendChild(newPrice);

const newAvailability = xmlDoc.createElement('availability');
newAvailability.textContent = 'Student Limited';
newTicket.appendChild(newAvailability);

xmlDoc.getElementsByTagName('tickets')[0].appendChild(newTicket);

// Serialize back to XML string
const xmlSerializer = new XMLSerializer();
const updatedXmlString = xmlSerializer.serializeToString(xmlDoc);

console.log('\n✅ Updated XML:');
console.log(updatedXmlString);

let btn = document.getElementById("checkoutbtn");

btn.onclick = function() {
  window.location.href = "checkout.html"
}