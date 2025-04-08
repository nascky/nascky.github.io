const stripe = Stripe('pk_test_51R3gG7ClTqY2dEMUePiYbAh80tjKEcITRgWK7aYs29sHDxNjOSSLoPGJuHk5ictqaSOv3f4FJB3eHVI2UIRZ2hrC00nmSbO3eU');

const elements = stripe.elements();

var style = {
  base: {
    iconColor: '#666EE8',
    color: '#31325F',
    lineHeight: '40px',
    fontWeight: 300,
    fontFamily: 'Helvetica Neue',
    fontSize: '15px',

    '::placeholder': {
      color: '#CFD7E0',
    },
  },
};

var cardNumberElement = elements.create('cardNumber', {style: style});
cardNumberElement.mount('#card-number-element');

var cardExpiryElement = elements.create('cardExpiry', {style: style});
cardExpiryElement.mount('#card-expiry-element');

var cardCvcElement = elements.create('cardCvc', {style: style});
cardCvcElement.mount('#card-cvc-element');

/*
const expressCheckoutElement = checkout.createExpressCheckoutElement();
expressCheckoutElement.on('confirm', (event) => {
  checkout.confirm({expressCheckoutConfirmEvent: event})
});
expressCheckoutElement.mount('#express-checkout-element');
*/

function setOutcome(result) {
  var successElement = document.querySelector('.success');
  var errorElement = document.querySelector('.error');
  successElement.classList.remove('visible');
  errorElement.classList.remove('visible');

  if (result.token) {
    // In this example, we're simply displaying the token
    successElement.querySelector('.token').textContent = result.token.id;
    successElement.classList.add('visible');

    // In a real integration, you'd submit the form with the token to your backend server
    //var form = document.querySelector('form');
    //form.querySelector('input[name="token"]').setAttribute('value', result.token.id);
    //form.submit();
  } else if (result.error) {
    errorElement.textContent = result.error.message;
    errorElement.classList.add('visible');
  }
}

cardNumberElement.on('change', function(event) {
  setOutcome(event);
});

cardExpiryElement.on('change', function(event) {
  setOutcome(event);
});

cardCvcElement.on('change', function(event) {
  setOutcome(event);
});

document.querySelector('form').addEventListener('submit', function(e) {
  e.preventDefault();
  var options = {
    address_zip: document.getElementById('postal-code').value,
  };
  stripe.createToken(cardNumberElement, options).then(setOutcome);
});
// Assume payment is successful here (you already handle it)
const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get('eventId');

const currentUser = JSON.parse(localStorage.getItem('currentUser'));
const userTickets = JSON.parse(localStorage.getItem('tickets') || '{}');

if (currentUser && eventId) {
    const email = currentUser.email;
    if (!userTickets[email]) userTickets[email] = [];

    if (!userTickets[email].includes(eventId)) {
        userTickets[email].push(eventId);
        localStorage.setItem('tickets', JSON.stringify(userTickets));
    }

    alert('Payment successful! Ticket added to your account.');
    window.location.href = 'attendee.html';
}
