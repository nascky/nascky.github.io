window.addEventListener('DOMContentLoaded', () => {
    fetch('ratings.xml')
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const xml = parser.parseFromString(data, 'application/xml');
            const testimonials = xml.querySelectorAll('testimonial');
            const container = document.getElementById('testimonialContainer');
            
            testimonials.forEach(t => {
                const name = t.querySelector('name').textContent;
                const role = t.querySelector('role').textContent;
                const image = t.querySelector('image').textContent;
                const text = t.querySelector('text').textContent;
                const rating = parseFloat(t.querySelector('rating').textContent);

                const stars = Array.from({ length: 5 }, (_, i) => {
                    if (rating >= i + 1) return '<i class="fas fa-star"></i>';
                    else if (rating > i) return '<i class="fas fa-star-half-alt"></i>';
                    else return '<i class="far fa-star"></i>';
                }).join('');

                const card = document.createElement('div');
                card.className = 'testimonial-card';
                card.innerHTML = `
                    <img src="${image}" alt="${name}" class="author-image" />
                    <div class="testimonial-content">
                        <p class="testimonial-text">"${text}"</p>
                        <div class="testimonial-author">
                            <strong>${name}</strong><br>
                            <span>${role}</span>
                        </div>
                        <div class="testimonial-rating">${stars}</div>
                    </div>
                `;
                container.appendChild(card);
            });
        });
});
