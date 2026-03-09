const selectorSection = document.getElementById('department-selector');
const loginSection = document.getElementById('login-section');
const loginTitle = document.getElementById('login-title');
const activeDeptIcon = document.getElementById('active-dept-icon');
const loginForm = document.getElementById('login-form');

// Mostra il login specifico
function showLogin(departmentName, iconClass) {
    // Nasconde la scelta dei dipartimenti
    selectorSection.classList.add('hidden');
    
    // Aggiorna nome e icona del reparto selezionato
    loginTitle.textContent = departmentName;
    activeDeptIcon.className = iconClass;
    
    // Mostra il form
    loginSection.classList.remove('hidden');
}

// Torna indietro alla selezione
function showSelector() {
    loginSection.classList.add('hidden');
    loginForm.reset();
    selectorSection.classList.remove('hidden');
}

// Gestione invio modulo
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const matricola = document.getElementById('badge').value;
    const btnSubmit = document.querySelector('.btn-submit');
    
    // Effetto di caricamento visivo (Feedback visivo)
    const originalText = btnSubmit.innerHTML;
    btnSubmit.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Connessione...';
    btnSubmit.style.opacity = '0.8';
    btnSubmit.disabled = true;

    // Simulazione di collegamento al server
    setTimeout(() => {
        alert("Autenticazione richiesta al server IPRP per matricola: " + matricola + "\nReparto: " + loginTitle.textContent);
        
        // Ripristina il bottone
        btnSubmit.innerHTML = originalText;
        btnSubmit.style.opacity = '1';
        btnSubmit.disabled = false;
        
        // Qui potrai inserire il redirect alla dashboard, esempio:
        // window.location.href = "dashboard.html";
    }, 1500);
});
