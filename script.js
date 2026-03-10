// --- VELO DI SICUREZZA DTA (URL Google Apps Script Offuscato) ---
const _0x4d2a = "aHR0cHM6Ly9zY3JpcHQuZ29vZ2xlLmNvbS9tYWNyb3Mvcy9BS2Z5Y2J4anpVYVk0Y3Q5YXJETUNKUEZGbXFjenp2V1ZUUmVZM245ckJqd1lSck5TZW1xT0FBMTRGTS1tcHBjclJCVmlOLS9leGVj";
const DTA_ENDPOINT = atob(_0x4d2a); 

// --- OROLOGIO E UI DINAMICA ---
setInterval(() => {
    const clock = document.getElementById('system-clock');
    if(clock) clock.textContent = new Date().toLocaleTimeString('it-IT');
}, 1000);

window.showLogin = (name, img) => {
    document.getElementById('department-selector').classList.add('hidden');
    document.getElementById('login-title').textContent = name;
    document.getElementById('active-dept-icon').src = img;
    document.getElementById('dash-logo-reparto').src = img; // Imposta logo backend
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
    btn.innerHTML = 'Verifica DTA... <i class="fas fa-spinner fa-spin"></i>';

    try {
        const response = await fetch(`${DTA_ENDPOINT}?matricola=${mat}&password=${pwd}`);
        const result = await response.json();

        if (result.success) {
            // Popolamento Backend con i dati dal foglio Google
            document.getElementById('logged-user-name').textContent = result.nome;
            document.getElementById('logged-user-rank').textContent = result.grado;
            document.getElementById('logged-user-badge').textContent = "Matricola: " + mat;
            document.getElementById('dash-dept-display').textContent = result.reparto.toUpperCase();
            document.getElementById('welcome-message').textContent = "Terminale Attivo: " + result.grado + " " + result.nome;
            
            // Transizione alla Dashboard
            document.getElementById('auth-screen').classList.add('hidden');
            document.getElementById('dashboard-section').style.display = 'flex';
            document.getElementById('dashboard-section').classList.remove('hidden');
            document.getElementById('main-navbar').classList.add('hidden');
        } else {
            alert("ACCESSO NEGATO: Credenziali non valide.");
        }
    } catch (err) {
        alert("ERRORE DI RETE: Impossibile contattare il DB Google.");
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Inizializza Connessione <i class="fas fa-fingerprint"></i>';
    }
});
