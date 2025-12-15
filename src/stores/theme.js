import { writable } from 'svelte/store';

const STORAGE_KEY = 'siyanati_theme_v1';

function getSystemPref() {
  try { return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; } catch { return 'light'; }
}

function applyTheme(t) {
  try {
    document.documentElement.setAttribute('data-theme', t);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'dark' ? '#0b1020' : '#0ea5e9');
  } catch {}
}

function createThemeStore() {
  let initial = 'light';
  try {
    initial = localStorage.getItem(STORAGE_KEY) || getSystemPref();
  } catch {}
  const { subscribe, set, update } = writable(initial);

  // Apply on init and on changes
  applyTheme(initial);
  subscribe((val) => {
    applyTheme(val);
    try { localStorage.setItem(STORAGE_KEY, val); } catch {}
  });

  function toggle() { update(v => v === 'dark' ? 'light' : 'dark'); }
  function setTheme(v) { set(v); }

  return { subscribe, toggle, set: setTheme };
}

export const theme = createThemeStore();
