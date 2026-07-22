(function () {
  // If already logged in, skip straight to dashboard
  if (NexAuth.isLoggedIn()) {
    window.location.href = 'dashboard.html';
    return;
  }

  const loginView = document.getElementById('login-view');
  const resetView = document.getElementById('reset-view');
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');
  const showResetBtn = document.getElementById('show-reset');
  const backToLoginBtn = document.getElementById('back-to-login');

  const resetForm = document.getElementById('reset-form');
  const resetError = document.getElementById('reset-error');
  const resetSuccess = document.getElementById('reset-success');

  showResetBtn.addEventListener('click', () => {
    loginView.classList.add('hidden');
    resetView.classList.remove('hidden');
    resetError.classList.remove('show');
    resetSuccess.classList.remove('show');
  });

  backToLoginBtn.addEventListener('click', () => {
    resetView.classList.add('hidden');
    loginView.classList.remove('hidden');
    loginError.classList.remove('show');
  });

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const creds = NexAuth.getCredentials();

    if (username === creds.username && password === creds.password) {
      loginError.classList.remove('show');
      NexAuth.login();
      window.location.href = 'dashboard.html';
    } else {
      loginError.textContent = 'Incorrect username or password.';
      loginError.classList.add('show');
    }
  });

  resetForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('reset-username').value.trim();
    const newPassword = document.getElementById('reset-new-password').value;
    const confirmPassword = document.getElementById('reset-confirm-password').value;
    const creds = NexAuth.getCredentials();

    resetSuccess.classList.remove('show');

    if (username !== creds.username) {
      resetError.textContent = 'That username does not match this account.';
      resetError.classList.add('show');
      return;
    }
    if (newPassword.length < 6) {
      resetError.textContent = 'New password must be at least 6 characters.';
      resetError.classList.add('show');
      return;
    }
    if (newPassword !== confirmPassword) {
      resetError.textContent = 'Passwords do not match.';
      resetError.classList.add('show');
      return;
    }

    NexAuth.setCredentials(creds.username, newPassword);
    resetError.classList.remove('show');
    resetSuccess.classList.add('show');
    resetForm.reset();
  });
})();
