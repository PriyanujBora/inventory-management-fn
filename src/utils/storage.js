// localStorage can be unavailable (private browsing, blocked storage); the app then simply forgets.

export const loadJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
};

export const saveJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable: nothing is remembered, everything else still works.
  }
};

export const removeKey = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {
    // Storage unavailable
  }
};
