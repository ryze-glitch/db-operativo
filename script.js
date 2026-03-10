// Importa Firebase (Senza Analytics per evitare i blocchi dell'AdBlocker/Tracking Prevention)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getFirestore, doc, collection, getDocFromServer, getDocsFromServer } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

// --- LA TUA CONFIGURAZIONE FIREBASE UFFICIALE ---
const firebaseConfig = {
    apiKey: "AIzaSyAYsesmrIxPL0_UJctwfRKLpQcElpeMRcU",
    authDomain: "database-sqmobile-digos.firebaseapp.com",
    projectId: "database-sqmobile-digos",
    storageBucket: "database-sqmobile-digos.firebasestorage.app",
    messagingSenderId: "510053226005",
    appId: "1:510053226005:web:aed636bc19a7e23b34e01c",
    measurementId: "G-W3F69LZP07"
};

// Inizializza l'app e il database
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Costanti UI
const selectorSection = document.getElementById('department-selector');
const loginSection = document.getElementById('login-section');
const loginTitle = document.getElementById('login-title');
const activeDeptIcon = document.getElementById('active-dept-icon');
const loginForm = document.getElementById('login-form');
const authScreen = document.getElementById('auth-screen');
const mainNavbar = document.getElementById('main-navbar');
const dashboardSection = document.getElementById('dashboard-section');

// --- OROLOGIO DI SISTEMA ---
function updateClock() {
    const clockElement = document.getElementById('system-clock');
    if(clockElement) clockElement.textContent = new Date().toLocaleTimeString('it-IT', { hour12: false });
}
setInterval(updateClock, 1000);
updateClock();

// --- SISTEMA DI NOTIFICHE TOAST ---
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
        toast.style.opacity = '0'; 
        setTimeout(() => toast.remove(), 400); 
    }, 4500);
}

// --- NAVIGAZIONE INTERFACCIA ---
window.showLogin = (name, img) => {
    selectorSection.classList.add('hidden');
    loginTitle.textContent = name;
    activeDeptIcon.src = img;
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

// --- TIMER 10 GIORNI ---
const tenDaysFromNow = new Date().getTime() + (10 * 24 * 60 * 60 * 1000);
setInterval(() => {
    const distance = tenDaysFromNow - new Date().getTime();
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const txt = `${days}g ${hours}h`;
    document.getElementById('timer-digos').textContent = "Sblocco in: " + txt;
    document.getElementById('timer-nos').textContent = "Sblocco in: " + txt;
}, 1000);

// --- LOGICA LOGIN AL DATABASE ---
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const matricolaInput = document.getElementById('badge').value.trim();
    const passwordInput = document.getElementById('password').value.trim();
    const btnSubmit = document.getElementById('btn-submit');

    const originalContent = btnSubmit.innerHTML;
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<span>Verifica Identità in corso...</span> <i class="fas fa-circle-notch fa-spin"></i>';

    try {
        const userRef = doc(db, "utenti", matricolaInput);
        
        // GETDOCFROMSERVER: Obbliga il browser a chiedere al database vero e proprio, bypassando la cache!
        const userSnap = await getDocFromServer(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data();
            
            if (userData.password === passwordInput) {
                // Successo
                document.getElementById('logged-user-name').textContent = userData.nome || "Operatore";
                document.getElementById('logged-user-rank').textContent = userData.grado || "Grado n.d.";
                document.getElementById('logged-user-badge').textContent = "ID Matr: " + matricolaInput;
                document.getElementById('dash-dept-display').textContent = userData.reparto || "P. DI STATO";
                document.getElementById('welcome-message').textContent = "Bentornato, " + (userData.grado || "Agente") + " " + (userData.nome || "");

                showToast("Accesso Autorizzato", "Identità confermata. Benvenuto nel sistema.", "success");
                
                setTimeout(() => {
                    authScreen.classList.add('hidden');
                    mainNavbar.classList.add('hidden');
                    dashboardSection.classList.remove('hidden');
                }, 1000);
            } else {
                showToast("Errore di Sicurezza", "Il codice di sicurezza inserito non è corretto.", "error");
            }
        } else {
            // Documento non trovato
            showToast("Soggetto Ignoto", "Matricola non trovata. Controlla la console (F12).", "error");
            
            // --- DIAGNOSTICA SERVER ---
            console.log("--------------------------------------------------");
            console.log(`❌ ERRORE: Non trovo il documento "${matricolaInput}". Avvio la lettura forzata dal server...`);
            
            try {
                // Legge TUTTI i documenti ignorando la cache
                const querySnapshot = await getDocsFromServer(collection(db, "utenti"));
                const tuttiDocumenti = [];
                
                querySnapshot.forEach((docItem) => {
                    tuttiDocumenti.push(`[${docItem.id}]`);
                });
                
                if(tuttiDocumenti.length === 0) {
                    console.warn("⚠️ IL SERVER DICE CHE LA RACCOLTA 'utenti' È COMPLETAMENTE VUOTA.");
                } else {
                    console.log("✅ LISTA DEI DOCUMENTI EFFETTIVAMENTE VISTI DAL SITO:");
                    console.log(tuttiDocumenti.join(" , "));
                    console.log("Se la tua matricola è nella lista qui sopra, assicurati di scriverla esattamente uguale (maiuscole/minuscole comprese).");
                }
            } catch(e) {
                console.error("⚠️ Non ho i permessi per scansionare.", e);
            }
            console.log("--------------------------------------------------");
        }
    } catch (error) {
        showToast("Errore di Rete", "Errore di connessione. Ricarica la pagina con CTRL + F5.", "error");
        console.error(error);
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = originalContent;
    }
});
