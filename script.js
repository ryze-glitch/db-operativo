// Importa Firebase (SDK Versione 12.10.0) 
// NIENTE Analytics per evitare l'errore dell'AdBlocker!
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

// --- LA TUA CONFIGURAZIONE FIREBASE REALE ---
const firebaseConfig = {
    apiKey: "AIzaSyAYsesmrIxPL0_UJctwfRKLpQcElpeMRcU",
    authDomain: "database-sqmobile-digos.firebaseapp.com",
    projectId: "database-sqmobile-digos",
    storageBucket: "database-sqmobile-digos.firebasestorage.app",
    messagingSenderId: "510053226005",
    appId: "1:510053226005:web:aed636bc19a7e23b34e01c"
};

// Inizializza l'app e il database Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Costanti UI - Pagine e Layout
const selectorSection = document.getElementById('department-selector');
const loginSection = document.getElementById('login-section');
const loginTitle = document.getElementById('login-title');
const activeDeptIcon = document.getElementById('active-dept-icon');
const loginForm = document.getElementById('login-form');
const authScreen = document.getElementById('auth-screen');
const mainNavbar = document.getElementById('main-navbar');
const dashboardSection = document.getElementById('dashboard-section');

// Costanti UI - Profilo Dashboard
const loggedUserName = document.getElementById('logged-user-name');
const loggedUserRank = document.getElementById('logged-user-rank');
const loggedUserBadge = document.getElementById('logged-user-badge');
const dashDeptDisplay = document.getElementById('dash-dept-display');
const welcomeMsg = document.getElementById('welcome-message');

// --- OROLOGIO DI SISTEMA (Nuova Status Bar) ---
function updateClock() {
    const clockElement = document.getElementById('system-clock');
    if(clockElement) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('it-IT', { hour12: false });
        clockElement.textContent = timeString;
    }
}
setInterval(updateClock, 1000);
updateClock();

// --- SISTEMA DI NOTIFICHE CUSTOM (Toast) ---
function showToast(title, message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let iconClass = 'fa-info-circle';
    if (type === 'success') iconClass = 'fa-check-circle';
    if (type === 'error') iconClass = 'fa-exclamation-triangle';

    toast.innerHTML = `
        <div class="toast-icon"><i class="fas ${iconClass}"></i></div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOutToast 0.4s ease-out forwards';
        setTimeout(() => toast.remove(), 400); 
    }, 4500);
}

// --- NAVIGAZIONE INTERFACCIA ---
window.showLogin = (departmentName, imageSrc) => {
    selectorSection.classList.add('hidden');
    loginTitle.textContent = departmentName;
    document.getElementById('active-dept-icon').src = imageSrc;
    loginSection.classList.remove('hidden');
    
    // Riavvia l'animazione
    loginSection.style.animation = 'none';
    loginSection.offsetHeight; 
    loginSection.style.animation = 'slideInRight 0.4s ease-out forwards';
};

window.showSelector = () => {
    loginSection.classList.add('hidden');
    loginForm.reset();
    selectorSection.classList.remove('hidden');
    
    // Riavvia l'animazione
    selectorSection.style.animation = 'none';
    selectorSection.offsetHeight; 
    selectorSection.style.animation = 'slideInRight 0.4s ease-out forwards';
};

window.logout = () => {
    // Il logout ricarica la pagina per azzerare i dati in memoria
    location.reload(); 
};

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

// --- LOGICA LOGIN AL DATABASE FIRESTORE ---
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const matricolaInput = document.getElementById('badge').value.trim();
    const passwordInput = document.getElementById('password').value.trim();
    const btnSubmit = document.getElementById('btn-submit');
    
    const originalContent = btnSubmit.innerHTML;
    
    // Effetto visivo di caricamento
    btnSubmit.innerHTML = '<span>Verifica Identità...</span> <i class="fas fa-circle-notch fa-spin"></i>';
    btnSubmit.disabled = true;

    try {
        // Cerca il documento nella collezione 'utenti'
        const userRef = doc(db, "utenti", matricolaInput);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data();
            
            // Verifica che la password coincida
            if (userData.password === passwordInput) {
                
                // Popolamento dei dati dinamici nella Dashboard (Backend)
                loggedUserName.textContent = userData.nome || "Operatore Sconosciuto";
                loggedUserRank.textContent = userData.grado || "Grado n.d.";
                loggedUserBadge.textContent = "ID Matr: " + matricolaInput;
                dashDeptDisplay.textContent = userData.reparto || "P. DI STATO";
                welcomeMsg.textContent = "Bentornato, " + (userData.grado || "Agente") + " " + (userData.nome || "");

                showToast("Accesso Autorizzato", "Credenziali verificate. Benvenuto nel sistema.", "success");
                
                // Effettua la transizione verso il backend
                setTimeout(() => {
                    authScreen.classList.add('hidden');
                    mainNavbar.classList.add('hidden');
                    dashboardSection.classList.remove('hidden');
                }, 1000);
                
            } else {
                showToast("Errore di Sicurezza", "Il codice di sicurezza inserito non è corretto.", "error");
            }
        } else {
            showToast("Soggetto Ignoto", "La matricola inserita non risulta registrata nel database.", "error");
        }
    } catch (error) {
        showToast("Errore di Sistema", "Accesso al database negato. Hai configurato le regole su Firebase?", "error");
        console.error("Dettaglio Errore:", error);
    } finally {
        // Ripristina sempre il bottone
        btnSubmit.innerHTML = originalContent;
        btnSubmit.disabled = false;
    }
});
