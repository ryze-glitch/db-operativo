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

// === LOGICA TIMER 10 GIORNI (DIGOS / NOS) ===
// Imposta la data a 10 giorni da adesso (modificabile)
const tenDaysFromNow = new Date().getTime() + (10 * 24 * 60 * 60 * 1000);

const countdownTimer = setInterval(() => {
    const now = new Date().getTime();
    const distance = tenDaysFromNow - now;

    // Calcoli per giorni, ore, minuti e secondi
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

// === LOGICA DI ACCESSO E TRANSIZIONE DASHBOARD ===
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const matricola = document.getElementById('badge').value;
    const btnSubmit = document.querySelector('.cyber-btn');
    
    // Salva il contenuto originale del bottone
    const originalContent = btnSubmit.innerHTML;
    
    // Cambia il bottone in stato di caricamento
    btnSubmit.innerHTML = '<span>Verifica Credenziali...</span> <i class="fas fa-circle-notch fa-spin"></i>';
    btnSubmit.style.opacity = '0.8';
    btnSubmit.disabled = true;

    // Simula connessione database di 1.5 secondi
    setTimeout(() => {
        // Ripristina lo stato del bottone
        btnSubmit.innerHTML = originalContent;
        btnSubmit.style.opacity = '1';
        btnSubmit.disabled = false;
        
        // Imposta la matricola nella dashboard
        loggedUserBadge.textContent = "Matr. " + matricola;

        // Entra nella dashboard nascondendo il resto (nello stesso file HTML)
        authScreen.classList.add('hidden');
        mainNavbar.classList.add('hidden');
        dashboardSection.classList.remove('hidden');
        
        // Resetta form in background
        loginForm.reset();
        showSelector();
    }, 1500);
});

// Funzione di Disconnessione (torna alla home)
function logout() {
    dashboardSection.classList.add('hidden');
    authScreen.classList.remove('hidden');
    mainNavbar.classList.remove('hidden');
}
