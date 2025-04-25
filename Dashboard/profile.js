// Modal functionaliteit voor "Over Mij" bewerken
const editModal = document.getElementById('edit-modal');
const modalTitle = document.getElementById('modal-title');
const modalInput = document.getElementById('modal-input');
const modalOk = document.getElementById('modal-ok');
const modalCancel = document.getElementById('modal-cancel');
let currentField = null;

document.querySelectorAll('.editable').forEach(item => {
    item.addEventListener('click', () => {
        currentField = item.getAttribute('data-field');
        const currentValue = document.getElementById(currentField).innerText;
        modalTitle.innerText = `Pas ${currentField.replace('-', ' ')} aan`;
        modalInput.value = currentValue;
        editModal.style.display = 'flex';
    });
});

modalOk.addEventListener('click', () => {
    const newValue = modalInput.value.trim();
    if (newValue !== '') {
        document.getElementById(currentField).innerText = newValue;
    }
    editModal.style.display = 'none';
});

modalCancel.addEventListener('click', () => {
    editModal.style.display = 'none';
});

// Modal functionaliteit voor profielfoto
const profilePicModal = document.getElementById('profile-pic-modal');
const profilePicChoose = document.getElementById('profile-pic-choose');
const profilePicRemove = document.getElementById('profile-pic-remove');
const profilePicCancel = document.getElementById('profile-pic-cancel');
const profilePic = document.getElementById('profile-pic');
const profilePicUpload = document.getElementById('profile-pic-upload');
const profilePicImg = document.getElementById('profile-pic-img');
const profilePicIcon = document.getElementById('profile-pic-icon');

profilePic.addEventListener('click', () => {
    profilePicModal.style.display = 'flex';
});

profilePicChoose.addEventListener('click', () => {
    profilePicUpload.click(); // Activeert de bestandskeuze
    profilePicModal.style.display = 'none';
});

profilePicRemove.addEventListener('click', () => {
    profilePicImg.src = '';
    profilePicImg.style.display = 'none';
    profilePicIcon.style.display = 'block';
    profilePicModal.style.display = 'none';
});

profilePicCancel.addEventListener('click', () => {
    profilePicModal.style.display = 'none';
});

profilePicUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            profilePicImg.src = e.target.result;
            profilePicImg.style.display = 'block';
            profilePicIcon.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
});

// Voeg fade-out animatie toe aan alle links (behalve modals en profielfoto)
document.querySelectorAll('a:not(.btn)').forEach(link => {
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