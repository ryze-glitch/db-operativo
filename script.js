// Importa Firebase (SDK Versione 12.10.0)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-analytics.js";

// --- LA TUA CONFIGURAZIONE FIREBASE REALE ---
const firebaseConfig = {
    apiKey: "AIzaSyAYsesmrIxPL0_UJctwfRKLpQcElpeMRcU",
    authDomain: "database-sqmobile-digos.firebaseapp.com",
    projectId: "database-sqmobile-digos",
    storageBucket: "database-sqmobile-digos.firebasestorage.app",
    messagingSenderId: "510053226005",
    appId: "1:510053226005:web:aed636bc19a7e23b34e01c",
    measurementId: "G-W3F69LZP07"
};

// Inizializza l'app, il database Firestore e Analytics
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// Costanti UI
const selectorSection = document.getElementById('department-selector');
const loginSection = document.getElementById('login-section');
const loginTitle = document.getElementById('login-title');
const activeDeptIcon = document.getElementById('active-dept-icon');
const loginForm = document.getElementById('login-form');
const authScreen = document.getElementById('auth-screen');
const mainNavbar = document.getElementById('main-navbar');
const dashboardSection = document.getElementById('dashboard-section');

// Elementi Profilo Dashboard
const loggedUserName = document.getElementById('logged-user-name');
const loggedUserRank = document.getElementById('logged-user-rank');
const loggedUserBadge = document.getElementById('logged-user-badge');
const dashDeptDisplay = document.getElementById('dash-dept-display');
const welcomeMsg = document.getElementById('welcome-message');

// --- SISTEMA DI NOTIFICHE CUSTOM ---
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

// Esposizione funzioni globali per HTML (Necessario con type="module")
window.showLogin = (departmentName, imageSrc) => {
    selectorSection.classList.add('hidden');
    loginTitle.textContent = departmentName;
    activeDeptIcon.src = imageSrc;
    loginSection.classList.remove('hidden');
};

window.showSelector = () => {
    loginSection.classList.add('hidden');
    loginForm.reset();
    selectorSection.classList.remove('hidden');
};

window.logout = () => {
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


// --- LOGICA LOGIN CON FIRESTORE ---
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const matricolaInput = document.getElementById('badge').value.trim();
    const passwordInput = document.getElementById('password').value.trim();
    const btnSubmit = document.getElementById('btn-submit');
    
    const originalContent = btnSubmit.innerHTML;
    btnSubmit.innerHTML = '<span>Verifica Identità...</span> <i class="fas fa-circle-notch fa-spin"></i>';
    btnSubmit.disabled = true;

    try {
        // Cerca il documento nella collezione 'utenti' usando la matricola come ID
        const userRef = doc(db, "utenti", matricolaInput);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data();
            
            // Verifica che il campo "password" nel database corrisponda a quello inserito
            if (userData.password === passwordInput) {
                
                // Popolamento dei dati dinamici dal database nella Dashboard
                loggedUserName.textContent = userData.nome || "Operatore Sconosciuto";
                loggedUserRank.textContent = userData.grado || "Grado n.d.";
                loggedUserBadge.textContent = "ID Matr: " + matricolaInput;
                dashDeptDisplay.textContent = userData.reparto || "P. DI STATO";
                welcomeMsg.textContent = "Bentornato, " + (userData.grado || "Agente") + " " + (userData.nome || "");

                showToast("Accesso Autorizzato", "Credenziali verificate. Benvenuto nel sistema.", "success");
                
                // Cambia visualizzazione da Login a Dashboard
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
        showToast("Errore di Sistema", "Problema di connessione al database. Verifica la configurazione.", "error");
        console.error(error);
    } finally {
        // Ripristina il bottone
        btnSubmit.innerHTML = originalContent;
        btnSubmit.disabled = false;
    }
});
