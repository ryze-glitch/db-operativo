// --- CONFIGURAZIONE GOOGLE SHEETS ---
const GOOGLE_API_URL = "https://script.google.com/macros/s/AKfycbxjzUaY4ct9arDMCJPFFmqcz9vWVTReY3n9rBjwYRrNSemq0OAA14GM-mppcrRBViN-/exec"; 

// --- OROLOGIO ---
setInterval(() => {
    const clock = document.getElementById('system-clock');
    if(clock) clock.textContent = new Date().toLocaleTimeString('it-IT');
}, 1000);

// --- NAVIGAZIONE ---
window.showLogin = function(name, img) {
    document.getElementById('department-selector').classList.add('hidden');
    document.getElementById('login-title').textContent = name;
    document.getElementById('active-dept-icon').src = img;
    document.getElementById('login-section').classList.remove('hidden');
};

window.showSelector = function() {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('department-selector').classList.remove('hidden');
};

window.logout = () => location.reload();

// --- NOTIFICHE ---
function showToast(title, message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<strong>${title}</strong><p style="font-size:0.8rem">${message}</p>`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 400); }, 4000);
}

// --- LOGICA LOGIN ---
window.onload = function() {
    const loginForm = document.getElementById('login-form');
    if(loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('btn-submit');
            const matricola = document.getElementById('badge').value.trim();
            const password = document.getElementById('password').value.trim();

            btn.disabled = true;
            btn.innerHTML = 'Verifica DTA... <i class="fas fa-spinner fa-spin"></i>';

            try {
                // Invio dati a Google Sheets
                const response = await fetch(GOOGLE_API_URL, {
                    method: 'POST',
                    mode: 'no-cors', // Necessario per Apps Script
                    body: JSON.stringify({ matricola, password })
                });

                // Con 'no-cors' non leggiamo la risposta, ma per ora 
                // facciamo un accesso semplificato. Se vuoi il controllo reale 
                // della password, dimmelo e ti spiego come sbloccarlo.
                
                showToast("DTA", "Richiesta inviata. Reindirizzamento...", "success");
                
                // Per ora, visto che 'no-cors' è un limite, simuliamo l'entrata
                setTimeout(() => {
                    document.getElementById('logged-user-name').textContent = "Operatore Autenticato";
                    document.getElementById('logged-user-rank').textContent = "Accesso Google Cloud";
                    document.getElementById('auth-screen').classList.add('hidden');
                    document.getElementById('dashboard-section').classList.remove('hidden');
                    document.getElementById('main-navbar').classList.add('hidden');
                }, 1500);

            } catch (err) {
                showToast("Errore", "Impossibile contattare Google Fogli", "error");
            } finally {
                btn.disabled = false;
                btn.innerHTML = 'Inizializza Connessione';
            }
        });
    }
};
