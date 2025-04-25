// Voeg fade-out animatie toe aan alle links
document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault(); // Voorkom standaardgedrag van de link
        const href = link.getAttribute('href');
        
        // Voeg fade-out klasse toe aan de body
        document.getElementById('page-body').classList.add('fade-out');
        
        // Wacht tot de animatie klaar is voordat je navigeert
        setTimeout(() => {
            window.location.href = href;
        }, 500); // Duur van de fade-out animatie (0.5s)
    });
});