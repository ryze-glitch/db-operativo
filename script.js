// --- CONFIGURAZIONE DIRETTA GOOGLE SHEETS (Senza cifratura per evitare bug) ---
const DTA_ENDPOINT = "https://script.google.com/macros/s/AKfycbxjzUaY4ct9arDMCJPFFmqcz9vWVTReY3n9rBjwYRrNSemq0OAA14GM-mppcrRBViN-/exec"; 

// --- OROLOGIO ---
setInterval(() => {
    const clock = document.getElementById('system-clock');
    if(clock) clock.textContent = new Date().toLocaleTimeString('it-IT');
}, 1000);

// --- SISTEMA NOTIFICHE TOAST ---
function showToast(title, message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<strong>${title}</strong><p style="font-size:0.8rem">${message}</p>`;
    container.appendChild(toast);
    
    // Rimuovi dopo 4 secondi
    setTimeout(() => { 
        toast.style.opacity = '0'; 
        setTimeout(() => toast.remove(), 400); 
    }, 4000);
}

// --- NAVIGAZIONE GLOBALE ---
window.showLogin = (name, img) => {
    document.getElementById('department-selector').classList.add('hidden');
    document.getElementById('login-title').textContent = name;
    document.getElementById('active-dept-icon').src = img;
    document.getElementById('dash-logo-reparto').src = img;
    document.getElementById('login-section').classList.remove('hidden');
};

window.showSelector = () => {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('department-selector').classList.remove('hidden');
};

window.logout = () => location.reload();

// --- LOGICA LOGIN GOOGLE SHEETS ---
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-submit');
    const mat = document.getElementById('badge').value.trim();
    const pwd = document.getElementById('password').value.trim();

    btn.disabled = true;
    btn.innerHTML = 'Interrogazione DTA... <i class="fas fa-spinner fa-spin"></i>';

    try {
        // Chiamata GET al Google Apps Script
        const response = await fetch(`${DTA_ENDPOINT}?matricola=${mat}&password=${pwd}`);
        const result = await response.json();

        if (result.success) {
            // Popolamento Backend
            document.getElementById('logged-user-name').textContent = result.nome;
            document.getElementById('logged-user-rank').textContent = result.grado;
            document.getElementById('logged-user-badge').textContent = "Matricola: " + mat;
            document.getElementById('dash-dept-display').textContent = result.reparto.toUpperCase();
            document.getElementById('welcome-message').textContent = "Terminale Attivo: " + result.grado + " " + result.nome;
            
            showToast("DTA - AUTORIZZATO", "Accesso al server centrale stabilito.", "success");

            setTimeout(() => {
                document.getElementById('auth-screen').classList.add('hidden');
                document.getElementById('dashboard-section').style.display = 'flex';
                document.getElementById('dashboard-section').classList.remove('hidden');
                document.getElementById('main-navbar').classList.add('hidden');
            }, 1000);
        } else {
            showToast("ACCESSO NEGATO", "Credenziali non trovate o errate.", "error");
        }
    } catch (err) {
        console.error("Errore connessione:", err);
        showToast("ERRORE DB", "Impossibile collegarsi al database Google.", "error");
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Inizializza Connessione <i class="fas fa-fingerprint"></i>';
    }
});
