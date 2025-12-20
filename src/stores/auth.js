import { writable, derived, get } from 'svelte/store';
import { authenticateWithMiniApps } from '../lib/api.js';

const USERS_KEY = 'siyanati_users_v1';
const SESSION_KEY = 'siyanati_session_v1';

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

export const users = writable(load(USERS_KEY, []));
users.subscribe((v) => save(USERS_KEY, v));

export const session = writable(load(SESSION_KEY, null));
session.subscribe((v) => save(SESSION_KEY, v));

export const currentUser = derived([users, session], ([$users, $session]) => {
  if (!$session?.userId) return null;
  return $users.find((u) => u.id === $session.userId) || null;
});

export function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export async function hashPassword(password) {
  try {
    const enc = new TextEncoder();
    const buf = await crypto.subtle.digest('SHA-256', enc.encode(password));
    const bytes = new Uint8Array(buf);
    return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    // Fallback (not secure, but avoids breaking on older browsers)
    return `sha256:${btoa(unescape(encodeURIComponent(password)))}`;
  }
}

export async function signup({ name, phone, email, password }) {
  name = (name || '').trim();
  phone = (phone || '').trim();
  email = (email || '').trim().toLowerCase();
  if (!name || !phone || !password) {
    return { ok: false, error: 'الرجاء إدخال الاسم والجوال وكلمة المرور' };
  }
  const list = get(users);
  if (list.some((u) => u.phone === phone)) return { ok: false, error: 'الجوال مسجل مسبقًا' };
  if (email && list.some((u) => u.email === email)) return { ok: false, error: 'البريد مسجل مسبقًا' };

  const passwordHash = await hashPassword(password);
  const user = { id: makeId(), name, phone, email: email || null, passwordHash, createdAt: new Date().toISOString() };
  users.update((arr) => [user, ...arr]);
  session.set({ userId: user.id });
  return { ok: true, user };
}

export async function login({ identifier, password }) {
  const list = get(users);
  const key = (identifier || '').trim().toLowerCase();
  const user = list.find((u) => u.phone === key || (u.email && u.email.toLowerCase() === key));
  if (!user) return { ok: false, error: 'الحساب غير موجود' };
  const passwordHash = await hashPassword(password || '');
  if (user.passwordHash !== passwordHash) return { ok: false, error: 'كلمة المرور غير صحيحة' };
  session.set({ userId: user.id });
  return { ok: true, user };
}

export function logout() {
  session.set(null);
}

export async function authenticateWithToken(token) {
  const result = await authenticateWithMiniApps(token);
  
  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  const userData = result.data;
  
  // Create or update user in local store based on MiniApps response
  const usersList = get(users);
  let existingUser = usersList.find(u => u.miniAppsId === userData.id || u.phone === userData.phone);
  
  if (existingUser) {
    // Update existing user with latest MiniApps data
    users.update(arr => arr.map(u => 
      u.id === existingUser.id 
        ? { ...u, ...userData, miniAppsId: userData.id, lastLogin: new Date().toISOString() }
        : u
    ));
    session.set({ userId: existingUser.id });
    return { ok: true, user: { ...existingUser, ...userData } };
  } else {
    // Create new user from MiniApps data
    const newUser = {
      id: makeId(),
      miniAppsId: userData.id,
      name: userData.name || 'مستخدم ميني أبس',
      phone: userData.phone || '',
      email: userData.email || null,
      passwordHash: null, // No password for MiniApps users
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      ...userData
    };
    
    users.update(arr => [newUser, ...arr]);
    session.set({ userId: newUser.id });
    return { ok: true, user: newUser };
  }
}
