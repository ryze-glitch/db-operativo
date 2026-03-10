import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getFirestore, doc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAYsesmrIxPL0_UJctwfRKLpQcElpeMRcU",
    authDomain: "database-sqmobile-digos.firebaseapp.com",
    projectId: "database-sqmobile-digos",
    storageBucket: "database-sqmobile-digos.firebasestorage.app",
    messagingSenderId: "510053226005",
    appId: "1:510053226005:web:aed636bc19a7e23b34e01c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// OROLOGIO
setInterval(() => {
    const clock = document.getElementById('system-clock');
    if(clock) clock.textContent = new Date().toLocaleTimeString('it-IT');
}, 1000);

// NOTIFICHE
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

// NAVIGAZIONE
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

// TIMER
const tenDays = new Date().getTime() + (10 * 24 * 60 * 60 * 1000);
setInterval(() => {
    const diff = tenDays - new Date().getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const txt = `${days}g ${hours}h`;
    document.getElementById('timer-digos').textContent = "Sblocco in: " + txt;
    document.getElementById('timer-nos').textContent = "Sblocco in: " + txt;
}, 1000);

// LOGIN
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const matricola = document.getElementById('badge').value.trim();
    const password = document.getElementById('password').value.trim();
    const btn = document.getElementById('btn-submit');

    btn.disabled = true;
    btn.innerHTML = 'Verifica in corso... <i class="fas fa-spinner fa-spin"></i>';

    try {
        const userRef = doc(db, "utenti", matricola);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const data = userSnap.data();
            if (data.password === password) {
                // Login Riuscito
                document.getElementById('logged-user-name').textContent = data.nome || "Operatore";
                document.getElementById('logged-user-rank').textContent = data.grado || "Grado n.d.";
                document.getElementById('logged-user-badge').textContent = "ID: " + matricola;
                document.getElementById('dash-dept-display').textContent = data.reparto || "P. DI STATO";
                document.getElementById('welcome-message').textContent = "Bentornato, " + (data.nome || "Agente");

                showToast("Accesso Autorizzato", "Identità confermata.", "success");
                
                setTimeout(() => {
                    document.getElementById('auth-screen').classList.add('hidden');
                    document.getElementById('dashboard-section').classList.remove('hidden');
                    document.getElementById('main-navbar').classList.add('hidden');
                }, 1000);
            } else {
                showToast("Errore di Sicurezza", "Password errata.", "error");
            }
        } else {
            // ERRORE: MATRICOLA NON TROVATA - ESEGUO SCANNER DIAGNOSTICO
            showToast("Soggetto Ignoto", "Matricola non trovata. Leggi la console F12.", "error");
            
            console.log("--------------------------------------------------");
            console.log(`❌ ERRORE: Il sistema non trova la matricola "${matricola}".`);
            console.log("🔍 Avvio lo scanner per leggere tutta la raccolta 'utenti'...");
            
            try {
                const querySnapshot = await getDocs(collection(db, "utenti"));
                const tuttiDocumenti = [];
                querySnapshot.forEach((docItem) => {
                    tuttiDocumenti.push(`[${docItem.id}]`);
                });
                
                if(tuttiDocumenti.length === 0) {
                    console.log("⚠️ La raccolta 'utenti' risulta COMPLETAMENTE VUOTA. Firebase non vede nessun documento.");
                } else {
                    console.log("✅ RISULTATO DELLO SCANNER. Ecco l'ID esatto (tra le parentesi quadre) dei documenti trovati:");
                    console.log(tuttiDocumenti.join(" , "));
                    console.log("💡 Suggerimento: Se il nome non è identico, copia il nome dalle parentesi quadre.");
                }
            } catch(e) {
                console.log("⚠️ Impossibile eseguire lo scanner. Permessi insufficienti o raccolta inesistente.", e);
            }
            console.log("--------------------------------------------------");
        }
    } catch (err) {
        showToast("Errore di Sistema", "Errore di rete. Controlla la console.", "error");
        console.error(err);
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Inizializza Connessione <i class="fas fa-fingerprint"></i>';
    }
});
