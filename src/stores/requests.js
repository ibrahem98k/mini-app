import { writable } from 'svelte/store';

const STORAGE_KEY = 'maintenance_requests_v1';

function createStore() {
  let initial = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) initial = JSON.parse(raw);
  } catch (e) { initial = []; }
  const { subscribe, set, update } = writable(initial);

  subscribe((val) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val));
    } catch (e) {}
  });

  function addRequest(req) {
    update((list) => [{ ...req }, ...list]);
  }

  function updateStatus(id, status) {
    update((list) => list.map(r => r.id === id ? { ...r, status } : r));
  }

  function remove(id) {
    update((list) => list.filter(r => r.id !== id));
  }

  function clear() { set([]); }

  return { subscribe, addRequest, updateStatus, remove, clear, set, update };
}

export const requests = createStore();

export function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
