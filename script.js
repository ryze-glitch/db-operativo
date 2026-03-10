// 1. Importa Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

// 2. La tua configurazione
const firebaseConfig = {
    apiKey: "AIzaSyDPyEfr0KbWtYDeM5-EFTl3s3VGVB_8Yi8",
    authDomain: "database-dta.firebaseapp.com",
    projectId: "database-dta",
    storageBucket: "database-dta.firebasestorage.app",
    messagingSenderId: "229305773627",
    appId: "1:229305773627:web:ec3d17f5fcb3c65fdb761e"
};

// 3. Avvia il Database
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 4. La funzione di Login
async function validaLogin(event) {
    if (event) event.preventDefault(); // Evita che la pagina si ricarichi se usi un <form>

    const matricolaInput = document.getElementById('matricola').value;
    const passwordInput = document.getElementById('password').value;
    const erroreMsg = document.getElementById('messaggio-errore'); // Assicurati di avere un div con questo ID nel tuo HTML

    if (erroreMsg) erroreMsg.innerText = "Controllo credenziali in corso...";

    try {
        const q = query(
            collection(db, "agenti"), 
            where("matricola", "==", matricolaInput), 
            where("password", "==", passwordInput)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            // Successo! Prendi i dati e salva (Incluso il GRADO)
            const datiAgente = querySnapshot.docs[0].data();
            localStorage.setItem('utenteLoggato', JSON.stringify(datiAgente));
            
            // Vai alla dashboard (assicurati che il nome del file sia corretto)
            window.location.href = 'dashboard.html';
        } else {
            if (erroreMsg) erroreMsg.innerText = "Accesso Negato: Credenziali errate.";
            else alert("Accesso Negato: Credenziali errate.");
        }
    } catch (error) {
        console.error("Errore DB:", error);
        if (erroreMsg) erroreMsg.innerText = "Errore di connessione al database.";
    }
}

// 5. Collega il bottone appena la pagina è caricata
document.addEventListener('DOMContentLoaded', () => {
    const btnLogin = document.getElementById('btn-login');
    if (btnLogin) {
        btnLogin.addEventListener('click', validaLogin);
    }
});
