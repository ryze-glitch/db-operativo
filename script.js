// Costanti UI Login
const selectorSection = document.getElementById('department-selector');
const loginSection = document.getElementById('login-section');
const loginTitle = document.getElementById('login-title');
const activeDeptIcon = document.getElementById('active-dept-icon');
const loginForm = document.getElementById('login-form');

// Costanti UI Cambio View
const authScreen = document.getElementById('auth-screen');
const mainNavbar = document.getElementById('main-navbar');
const dashboardSection = document.getElementById('dashboard-section');
const loggedUserBadge = document.getElementById('logged-user-badge');

// --- SISTEMA DI NOTIFICHE CUSTOM ---
function showToast(title, message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Seleziona icona in base al tipo
    let iconClass = 'fa-info-circle';
    if (type === 'success') iconClass = 'fa-check-circle';
    if (type === 'error') iconClass = 'fa-exclamation-triangle';
    if (type === 'warning') iconClass = 'fa-shield-alt';

    toast.innerHTML = `
        <div class="toast-icon"><i class="fas ${iconClass}"></i></div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
    `;

    container.appendChild(toast);

    // Rimuove la notifica dopo 4.5 secondi
    setTimeout(() => {
        toast.style.animation = 'fadeOutToast 0.4s ease-out forwards';
        setTimeout(() => toast.remove(), 400); // aspetta che finisca l'animazione css prima di eliminare il nodo
    }, 4500);
}

// Mostra il form di login con i dati del reparto scelto
function showLogin(departmentName, imageSrc) {
    selectorSection.classList.add('hidden');
    loginTitle.textContent = departmentName;
    activeDeptIcon.src = imageSrc;
    loginSection.classList.remove('hidden');
}

// Torna alla schermata di selezione
function showSelector() {
    loginSection.classList.add('hidden');
    loginForm.reset();
    selectorSection.classList.remove('hidden');
}

// --- LOGICA TIMER 10 GIORNI (DIGOS / NOS) ---
const tenDaysFromNow = new Date().getTime() + (10 * 24 * 60 * 60 * 1000);

const countdownTimer = setInterval(() => {
    const now = new Date().getTime();
    const distance = tenDaysFromNow - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const timeText = `${days}g ${hours}h ${minutes}m ${seconds}s`;

    document.getElementById("timer-digos").innerText = "Sblocco in: " + timeText;
    document.getElementById("timer-nos").innerText = "Sblocco in: " + timeText;

    if (distance < 0) {
        clearInterval(countdownTimer);
        document.getElementById("timer-digos").innerText = "Sviluppo Completato";
        document.getElementById("timer-nos").innerText = "Sviluppo Completato";
    }
}, 1000);

// --- CREDENZIALI DI ACCESSO SQUADRA MOBILE ---
const VALID_CREDENTIALS = {
    matricola: "SYSTEM-ADMIN-243292302",
    password: "CEYF7F832EYdiw9fdew"
};

// --- LOGICA DI ACCESSO E TRANSIZIONE DASHBOARD ---
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Raccogli i valori inseriti dall'utente
    const matricolaInput = document.getElementById('badge').value.trim();
    const passwordInput = document.getElementById('password').value.trim();
    
    const btnSubmit = document.querySelector('.cyber-btn');
    const originalContent = btnSubmit.innerHTML;
    
    // Animazione di caricamento sul bottone
    btnSubmit.innerHTML = '<span>Verifica Credenziali in corso...</span> <i class="fas fa-circle-notch fa-spin"></i>';
    btnSubmit.style.opacity = '0.8';
    btnSubmit.disabled = true;

    // Simula connessione sicura di 1.2 secondi
    setTimeout(() => {
        // Ripristina lo stato del bottone
        btnSubmit.innerHTML = originalContent;
        btnSubmit.style.opacity = '1';
        btnSubmit.disabled = false;
        
        // --- CONTROLLO DELLE CREDENZIALI ---
        if(matricolaInput === VALID_CREDENTIALS.matricola && passwordInput === VALID_CREDENTIALS.password) {
            
            // Credenziali corrette
            showToast("Identità Verificata", "Connessione sicura stabilita. Accesso autorizzato al terminale.", "success");
            
            // Estrai l'ID finale per pulizia (es. prende solo "243292302" da "SYSTEM-ADMIN-243292302")
            const idNumero = matricolaInput.split('-').pop();
            loggedUserBadge.textContent = "Agente: " + idNumero;

            // Entra nella dashboard nascondendo il resto
            authScreen.classList.add('hidden');
            mainNavbar.classList.add('hidden');
            dashboardSection.classList.remove('hidden');
            
            loginForm.reset();
            
        } else {
            // Credenziali errate
            showToast("Accesso Negato", "Matricola o Codice di Sicurezza non validi. Il tentativo è stato registrato.", "error");
            
            // Svuota solo il campo password per riprovare
            document.getElementById('password').value = '';
        }

    }, 1200);
});

// --- DISCONNESSIONE ---
// Funzione richiamata dal bottone "Disconnetti" nella sidebar della Dashboard
function logout() {
    // Rimuovi la classe active dagli altri tab e mettila su "Terminale Base" se necessario (opzionale)
    
    // Torna alla schermata principale
    dashboardSection.classList.add('hidden');
    authScreen.classList.remove('hidden');
    mainNavbar.classList.remove('hidden');
    
    // Ritorna alla selezione dei reparti
    showSelector();

    // Notifica di chiusura
    showToast("Disconnessione", "Chiusura sessione criptata completata con successo.", "info");
}
