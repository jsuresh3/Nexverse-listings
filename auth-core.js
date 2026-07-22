(function () {
  const CRED_KEY = 'nexverse_credentials';
  const SESSION_KEY = 'nexverse_session';

  const DEFAULT_CREDENTIALS = { username: 'Nexverse', password: 'test1234' };

  function getCredentials() {
    const stored = NexStorage.get(CRED_KEY);
    if (stored && stored.username && stored.password) return stored;
    NexStorage.set(CRED_KEY, DEFAULT_CREDENTIALS);
    return DEFAULT_CREDENTIALS;
  }

  function setCredentials(username, password) {
    NexStorage.set(CRED_KEY, { username, password });
  }

  function isLoggedIn() {
    return NexStorage.get(SESSION_KEY) === 'active';
  }

  function login() {
    NexStorage.set(SESSION_KEY, 'active');
  }

  function logout() {
    NexStorage.remove(SESSION_KEY);
  }

  window.NexAuth = { getCredentials, setCredentials, isLoggedIn, login, logout };
})();
