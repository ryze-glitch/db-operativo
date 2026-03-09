const selectorSection = document.getElementById('department-selector');
const loginSection = document.getElementById('login-section');
const loginTitle = document.getElementById('login-title');
const activeDeptIcon = document.getElementById('active-dept-icon');
const loginForm = document.getElementById('login-form');

function showLogin(departmentName, iconClass) {
    selectorSection.classList.add('hidden');
    loginTitle.textContent = departmentName;
    activeDeptIcon.className = iconClass;
    loginSection.classList.remove('hidden');
}

function showSelector() {
    loginSection.classList.add('hidden');
    loginForm.reset();
    selectorSection.classList.remove('hidden');
}

loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const matricola = document.getElementById('badge').value;
    const btnSubmit = document.querySelector('.btn-submit');
    
    const originalText = btnSubmit.innerHTML;
    btnSubmit.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Connessione...';
    btnSubmit.disabled = true;

    setTimeout(() => {
        alert("Autenticazione richiesta per matricola: " + matricola + " | Reparto: " + loginTitle.textContent);
        btnSubmit.innerHTML = originalText;
        btnSubmit.disabled = false;
    }, 1500);
});
