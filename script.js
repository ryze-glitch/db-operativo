// --- CONFIGURAZIONE SUPABASE DB OPERATIVO - DTA ---
const SUPABASE_URL = "https://dyzezjsclrqhgmhsvcjz.supabase.co"; 
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5emV6anNjbHJxaGdtaHN2Y2p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMzEyMjUsImV4cCI6MjA4ODcwNzIyNX0.MkVhSRieNBd2EylrRTfSp-PRDosV6FjmzdznnVgG7g4";

// Inizializzazione Client con Bypass per Edge/Brave
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false }
});

// --- FUNZIONI DI NAVIGAZIONE GLOBALI ---
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

window.logout = function() {
    location.reload();
};

// --- OROLOGIO ---
setInterval(() => {
    const clock = document.getElementById('system-clock');
    if(clock) clock.textContent = new Date().toLocaleTimeString('it-IT');
}, 1000);

// --- NOTIFICHE (TOAST) ---
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

// --- LOGICA LOGIN ---
window.onload = function() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const matricolaInput = document.getElementById('badge').value.trim();
            const passwordInput = document.getElementById('password').value.trim();
            const btn = document.getElementById('btn-submit');

            btn.disabled = true;
            btn.innerHTML = 'Verifica DTA... <i class="fas fa-spinner fa-spin"></i>';

            try {
                // Interrogazione tabella 'utenti'
                const { data, error } = await supabaseClient
                    .from('utenti')
                    .select('*')
                    .eq('matricola', matricolaInput)
                    .maybeSingle();

                if (error) throw error;

                if (!data) {
                    showToast("Soggetto Ignoto", "Matricola non censita.", "error");
                } else {
                    if (data.password === passwordInput) {
                        // Successo: Popola Dashboard
                        document.getElementById('logged-user-name').textContent = data.nome || "Utente";
                        document.getElementById('logged-user-rank').textContent = data.grado || "Grado N.D.";
                        document.getElementById('logged-user-badge').textContent = "Matricola: " + (data.matricola || matricolaInput);
                        document.getElementById('dash-dept-display').textContent = data.reparto || "DTA";
                        document.getElementById('welcome-message').textContent = "Terminale Operativo: " + (data.grado || "") + " " + (data.nome || "");
                        
                        showToast("DTA - Autorizzato", "Accesso stabilito.", "success");
                        
                        setTimeout(() => {
                            document.getElementById('auth-screen').classList.add('hidden');
                            document.getElementById('dashboard-section').classList.remove('hidden');
                            document.getElementById('main-navbar').classList.add('hidden');
                        }, 1000);
                    } else {
                        showToast("Errore", "Password non valida.", "error");
                    }
                }
            } catch (err) {
                console.error("Errore Database:", err);
                showToast("Errore Server", "Connessione fallita. Controlla la Policy RLS su Supabase.", "error");
            } finally {
                btn.disabled = false;
                btn.innerHTML = 'Inizializza Connessione <i class="fas fa-fingerprint"></i>';
            }
        });
    }
};
