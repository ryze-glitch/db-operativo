// --- CONFIGURAZIONE SUPABASE DB OPERATIVO - DTA ---
const SUPABASE_URL = "https://dyzezjsclrqhgmhsvcjz.supabase.co"; 
const SUPABASE_KEY = "sb_publishable_Ehe0xXuVzh831bAADsjZig_8sB1yj0N";

// Inizializzazione Client Supabase
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- OROLOGIO DI SISTEMA DTA ---
setInterval(() => {
    const clock = document.getElementById('system-clock');
    if(clock) clock.textContent = new Date().toLocaleTimeString('it-IT', { hour12: false });
}, 1000);

// --- SISTEMA NOTIFICHE ---
function showToast(title, message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<strong>${title}</strong><p style="font-size:0.8rem">${message}</p>`;
    container.appendChild(toast);
    setTimeout(() => { 
        toast.style.opacity = '0'; 
        setTimeout(() => toast.remove(), 400); 
    }, 4500);
}

// --- NAVIGAZIONE INTERFACCIA ---
window.showLogin = (name, img) => {
    document.getElementById('department-selector').classList.add('hidden');
    document.getElementById('login-title').textContent = name;
    document.getElementById('active-dept-icon').src = img;
    document.getElementById('login-section').classList.remove('hidden');
};

window.showSelector = () => {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('login-form').reset();
    document.getElementById('department-selector').classList.remove('hidden');
};

window.logout = () => {
    location.reload(); 
};

// --- LOGICA LOGIN DTA ---
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const matricolaInput = document.getElementById('badge').value.trim();
    const passwordInput = document.getElementById('password').value.trim();
    const btn = document.getElementById('btn-submit');

    btn.disabled = true;
    btn.innerHTML = 'Verifica DTA in corso... <i class="fas fa-spinner fa-spin"></i>';

    try {
        // Interrogazione alla tabella 'utenti'
        const { data, error } = await supabaseClient
            .from('utenti')
            .select('*')
            .eq('matricola', matricolaInput)
            .maybeSingle();

        if (error) throw error;

        if (!data) {
            showToast("Soggetto Ignoto", "Matricola non censita nel sistema DTA.", "error");
        } else {
            // Controllo Password
            if (data.password === passwordInput) {
                // Popolamento Dashboard
                document.getElementById('logged-user-name').textContent = data.nome;
                document.getElementById('logged-user-rank').textContent = data.grado;
                document.getElementById('logged-user-badge').textContent = "Matricola: " + data.matricola;
                document.getElementById('dash-dept-display').textContent = data.reparto;
                document.getElementById('welcome-message').textContent = "Terminale Operativo: " + data.grado + " " + data.nome;
                
                showToast("DTA - Accesso Autorizzato", "Connessione sicura stabilita.", "success");
                
                setTimeout(() => {
                    document.getElementById('auth-screen').classList.add('hidden');
                    document.getElementById('dashboard-section').classList.remove('hidden');
                    document.getElementById('main-navbar').classList.add('hidden');
                }, 1000);
            } else {
                showToast("Errore Sicurezza", "Codice di sicurezza errato.", "error");
            }
        }
    } catch (err) {
        console.error("Errore Supabase:", err);
        showToast("Errore Server", "Problema di comunicazione. Verifica la RLS Policy su Supabase.", "error");
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Inizializza Connessione <i class="fas fa-fingerprint"></i>';
    }
});
