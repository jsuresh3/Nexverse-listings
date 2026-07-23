(function () {
  const loginView = document.getElementById('login-view');
  const resetView = document.getElementById('reset-view');
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');
  const showResetBtn = document.getElementById('show-reset');
  const backToLoginBtn = document.getElementById('back-to-login');

  const resetForm = document.getElementById('reset-form');
  const resetError = document.getElementById('reset-error');
  const resetSuccess = document.getElementById('reset-success');

  async function init() {
    try {
      if (await NexAPI.checkSession()) {
        window.location.href = 'dashboard.html';
        return;
      }
    } catch (e) {
      // if the session check fails (e.g. backend not set up yet), just show the login form
    }
  }
  init();

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

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const submitBtn = loginForm.querySelector('button[type="submit"]');

    loginError.classList.remove('show');
    submitBtn.disabled = true;
    try {
      await NexAPI.login(username, password);
      window.location.href = 'dashboard.html';
    } catch (err) {
      loginError.textContent = err.message || 'Incorrect username or password.';
      loginError.classList.add('show');
    } finally {
      submitBtn.disabled = false;
    }
  });

  resetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('reset-username').value.trim();
    const newPassword = document.getElementById('reset-new-password').value;
    const confirmPassword = document.getElementById('reset-confirm-password').value;
    const submitBtn = resetForm.querySelector('button[type="submit"]');

    resetSuccess.classList.remove('show');
    resetError.classList.remove('show');

    if (newPassword !== confirmPassword) {
      resetError.textContent = 'Passwords do not match.';
      resetError.classList.add('show');
      return;
    }

    submitBtn.disabled = true;
    try {
      await NexAPI.resetPassword(username, newPassword);
      resetSuccess.classList.add('show');
      resetForm.reset();
    } catch (err) {
      resetError.textContent = err.message || 'Could not reset password.';
      resetError.classList.add('show');
    } finally {
      submitBtn.disabled = false;
    }
  });
})();
