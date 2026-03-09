const selectorSection = document.getElementById('department-selector');
const loginSection = document.getElementById('login-section');
const loginTitle = document.getElementById('login-title');
const activeDeptIcon = document.getElementById('active-dept-icon');
const loginForm = document.getElementById('login-form');

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

// Logica di caricamento realistica
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

    // Simula una chiamata al server di 1.5 secondi
    setTimeout(() => {
        alert("Terminale sbloccato per matricola: " + matricola + "\nAccesso confermato al server: " + loginTitle.textContent);
        
        // Ripristina lo stato (nella realtà qui faresti un redirect)
        btnSubmit.innerHTML = originalContent;
        btnSubmit.style.opacity = '1';
        btnSubmit.disabled = false;
        loginForm.reset();
        showSelector();
    }, 1500);
});
