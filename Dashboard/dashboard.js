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

// Fetch classes for student
async function fetchClasses() {
    try {
        const response = await fetch('https://edu-streakz-backend.vercel.app/api/classes/student', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch classes');
        }
        const data = await response.json();
        const classesList = document.getElementById('classes-list');
        classesList.innerHTML = '';
        if (data.length === 0) {
            classesList.innerHTML = '<li>Je bent nog niet ingeschreven in een klas.</li>';
        } else {
            data.forEach(cls => {
                const li = document.createElement('li');
                li.innerHTML = `<i class="fas fa-book"></i> ${cls.class_name} (Docent: ${cls.teacher_username})`;
                classesList.appendChild(li);
            });
        }
    } catch (error) {
        console.error('Error fetching classes:', error);
        document.getElementById('classes-list').innerHTML = '<li>Kon klassen niet laden.</li>';
    }
}

// Update DOMContentLoaded to include classes
document.addEventListener('DOMContentLoaded', async () => {
    const userData = await fetchUserData();
    if (userData) {
        await fetchLeaderboard();
        await fetchCommunity();
        await fetchClasses();
    }
});