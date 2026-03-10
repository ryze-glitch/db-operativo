// --- CONFIGURAZIONE DIRETTA GOOGLE SHEETS ---
const DTA_ENDPOINT = "https://script.google.com/macros/s/AKfycbw9PfzjM0E7pmQQK2FSmiWZry9tDQTLsRF6Rv_WEbeHrrOrLG5jdtj8YLk7tFKOcBw2/exec"; 

// --- OROLOGIO DI SISTEMA ---
setInterval(() => {
    const clock = document.getElementById('system-clock');
    if(clock) clock.textContent = new Date().toLocaleTimeString('it-IT');
}, 1000);

// --- SISTEMA NOTIFICHE TOAST ---
function showToast(title, message, type = 'info') {
    const container = document.getElementById('toast-container');
    if(!container) return; // Protezione se manca il div nell'html

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<strong>${title}</strong><p style="font-size:0.8rem">${message}</p>`;
    
    container.appendChild(toast);
    
    // Animazione di uscita e rimozione
    setTimeout(() => { 
        toast.style.opacity = '0'; 
        setTimeout(() => toast.remove(), 400); 
    }, 4000);
}

// --- FUNZIONI DI NAVIGAZIONE ---
window.showLogin = (name, img) => {
    document.getElementById('department-selector').classList.add('hidden');
    document.getElementById('login-title').textContent = name;
    document.getElementById('active-dept-icon').src = img;
    // Se hai un'immagine anche nella dashboard, la aggiorniamo qui
    const dashLogo = document.getElementById('dash-logo-reparto');
    if(dashLogo) dashLogo.src = img;
    
    document.getElementById('login-section').classList.remove('hidden');
};

window.showSelector = () => {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('department-selector').classList.remove('hidden');
};

window.logout = () => location.reload();

// --- LOGICA LOGIN REAL-TIME ---
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-submit');
    const mat = document.getElementById('badge').value.trim();
    const pwd = document.getElementById('password').value.trim();

    // Feedback visivo sul pulsante
    btn.disabled = true;
    btn.innerHTML = 'Verifica DTA in corso... <i class="fas fa-spinner fa-spin"></i>';

    try {
        // Chiamata GET a Google Sheets
        const response = await fetch(`${DTA_ENDPOINT}?matricola=${encodeURIComponent(mat)}&password=${encodeURIComponent(pwd)}`);
        const result = await response.json();

        if (result.success) {
            // Successo: Popoliamo la UI con i dati del Foglio Google
            document.getElementById('logged-user-name').textContent = result.nome;
            document.getElementById('logged-user-rank').textContent = result.grado;
            document.getElementById('logged-user-badge').textContent = "Matricola: " + mat;
            
            const deptDisplay = document.getElementById('dash-dept-display');
            if(deptDisplay) deptDisplay.textContent = result.reparto.toUpperCase();
            
            const welcomeMsg = document.getElementById('welcome-message');
            if(welcomeMsg) welcomeMsg.textContent = "Terminale Operativo: " + result.grado + " " + result.nome;
            
            showToast("ACCESSO AUTORIZZATO", "Connessione sicura stabilita con successo.", "success");

            // Transizione alla Dashboard
            setTimeout(() => {
                document.getElementById('auth-screen').classList.add('hidden');
                const dash = document.getElementById('dashboard-section');
                dash.style.display = 'flex'; // Forza il flex per la sidebar
                dash.classList.remove('hidden');
                
                const navbar = document.getElementById('main-navbar');
                if(navbar) navbar.classList.add('hidden');
            }, 1000);
            
        } else {
            showToast("ACCESSO NEGATO", "Credenziali non trovate nel database centrale.", "error");
        }
    } catch (err) {
        console.error("Errore connessione:", err);
        showToast("ERRORE DATABASE", "Impossibile contattare il server Google Sheets.", "error");
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Inizializza Connessione <i class="fas fa-fingerprint"></i>';
    }
});
