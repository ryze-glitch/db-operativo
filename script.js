const selectorSection = document.getElementById('department-selector');
const loginSection = document.getElementById('login-section');
const loginTitle = document.getElementById('login-title');
const loginForm = document.getElementById('login-form');

// Funzione per mostrare il login del dipartimento selezionato
function showLogin(departmentName) {
    // Nascondi i selettori
    selectorSection.classList.add('hidden');
    
    // Aggiorna il titolo del login
    loginTitle.textContent = `Accesso: ${departmentName}`;
    
    // Mostra il form
    loginSection.classList.remove('hidden');
}

// Funzione per tornare indietro alla selezione
function showSelector() {
    // Nascondi il form
    loginSection.classList.add('hidden');
    
    // Svuota i campi di input
    loginForm.reset();
    
    // Mostra i selettori
    selectorSection.classList.remove('hidden');
}

// Previene il ricaricamento della pagina all'invio del form (utile per test)
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const matricola = document.getElementById('badge').value;
    
    // Qui andrà la logica per il collegamento al database/backend
    console.log(`Tentativo di accesso. Matricola: ${matricola}`);
    alert("Credenziali inviate al server centrale per la verifica.");
});
