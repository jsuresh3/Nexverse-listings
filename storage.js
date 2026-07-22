/*
  NexStorage
  Small persistence helper used across the app.
  Tries localStorage first (works on Vercel's static hosting, persists per-browser).
  Falls back to cookies automatically if localStorage is unavailable
  (e.g. private browsing modes that block it).
*/
(function (global) {
  function localStorageAvailable() {
    try {
      const testKey = '__nexverse_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  const useLocalStorage = localStorageAvailable();

  function setCookie(name, value, days) {
    const maxAge = days ? `; max-age=${days * 24 * 60 * 60}` : '; max-age=31536000';
    document.cookie = `${name}=${encodeURIComponent(value)}${maxAge}; path=/; SameSite=Lax`;
  }

  function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  }

  function removeCookie(name) {
    document.cookie = `${name}=; max-age=0; path=/`;
  }

  const NexStorage = {
    get(key) {
      const raw = useLocalStorage ? window.localStorage.getItem(key) : getCookie(key);
      if (raw === null || raw === undefined) return null;
      try {
        return JSON.parse(raw);
      } catch (e) {
        return raw;
      }
    },
    set(key, value) {
      const raw = JSON.stringify(value);
      if (useLocalStorage) {
        try {
          window.localStorage.setItem(key, raw);
          return;
        } catch (e) {
          // storage quota exceeded or blocked mid-session — fall through to cookie
        }
      }
      setCookie(key, raw);
    },
    remove(key) {
      if (useLocalStorage) {
        window.localStorage.removeItem(key);
      } else {
        removeCookie(key);
      }
    },
    mode: useLocalStorage ? 'localStorage' : 'cookie'
  };

  global.NexStorage = NexStorage;
})(window);
