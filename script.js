// --- VELO DI SICUREZZA DTA (URL Offuscato) ---
const _0x4d2a = "aHR0cHM6Ly9zY3JpcHQuZ29vZ2xlLmNvbS9tYWNyb3Mvcy9BS2Z5Y2J4anpVYVk0Y3Q5YXJETUNKUEZGbXFjenp2V1ZUUmVZM245ckJqd1lSck5TZW1xT0FBMTRGTS1tcHBjclJCVmlOLS9leGVj";
const DTA_ENDPOINT = atob(_0x4d2a); 

// --- OROLOGIO E UI ---
setInterval(() => {
    const clock = document.getElementById('system-clock');
    if(clock) clock.textContent = new Date().toLocaleTimeString('it-IT');
}, 1000);

window.showLogin = (name, img) => {
    document.getElementById('department-selector').classList.add('hidden');
    document.getElementById('login-title').textContent = name;
    document.getElementById('active-dept-icon').src = img;
    document.getElementById('login-section').classList.remove('hidden');
};

window.showSelector = () => {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('department-selector').classList.remove('hidden');
};

window.logout = () => location.reload();

function showToast(title, message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<strong>${title}</strong><p>${message}</p>`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 400); }, 4000);
}

// --- LOGICA LOGIN REAL-TIME CON GOOGLE SHEETS ---
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-submit');
    const matricola = document.getElementById('badge').value.trim();
    const password = document.getElementById('password').value.trim();

    btn.disabled = true;
    btn.innerHTML = 'Verifica Credenziali DTA... <i class="fas fa-spinner fa-spin"></i>';

    try {
        // Chiamata sicura a Google Sheets
        const response = await fetch(`${DTA_ENDPOINT}?matricola=${matricola}&password=${password}`);
        const result = await response.json();

        if (result.success) {
            // Caricamento UI Vecchia
            document.getElementById('logged-user-name').textContent = result.nome;
            document.getElementById('logged-user-rank').textContent = result.grado;
            document.getElementById('logged-user-badge').textContent = "Matricola: " + result.matricola;
            document.getElementById('dash-dept-display').textContent = result.reparto;
            
            showToast("Accesso Eseguito", "Benvenuto nel terminale operativo.", "success");
            
            setTimeout(() => {
                document.getElementById('auth-screen').classList.add('hidden');
                document.getElementById('dashboard-section').classList.remove('hidden');
                document.getElementById('main-navbar').classList.add('hidden');
            }, 1000);
        } else {
            showToast("Errore Sicurezza", "Matricola o Password errati.", "error");
        }
    } catch (error) {
        showToast("Errore Server", "Impossibile contattare il database Google.", "error");
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Inizializza Connessione <i class="fas fa-fingerprint"></i>';
    }
});
