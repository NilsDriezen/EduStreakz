// Wisselen tussen formulieren
document.getElementById('show-signup').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'block';
});

document.getElementById('show-login').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
});

// Validatie van het registratieformulier
function validateForm() {
    const day = document.getElementById('birth-day').value;
    const month = document.getElementById('birth-month').value;
    const year = document.getElementById('birth-year').value;
    const dateError = document.getElementById('date-error');

    // Reset foutmelding
    dateError.textContent = '';

    // Controleer dag (1-31, max 2 cijfers)
    if (!day || day < 1 || day > 31 || day.length > 2) {
        dateError.textContent = 'Day must be between 1 and 31 and max 2 digits.';
        return false;
    }

    // Controleer maand (1-12, max 2 cijfers)
    if (!month || month < 1 || month > 12 || month.length > 2) {
        dateError.textContent = 'Month must be between 1 and 12 and max 2 digits.';
        return false;
    }

    // Controleer jaar (1900-2025, exact 4 cijfers)
    if (!year || year < 1900 || year > 2025 || year.length !== 4) {
        dateError.textContent = 'Year must be between 1900 and 2025 and exactly 4 digits.';
        return false;
    }

    return true; // Formulier is geldig
}