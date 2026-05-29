/* Auth - change ADMIN_PASSWORD below to update */
const ADMIN_PASSWORD = 'torque2026';
const AUTH_KEY = 'torque_auth_v1';

function isLoggedIn() { return localStorage.getItem(AUTH_KEY) === 'true'; }
function login(p) { if (p === ADMIN_PASSWORD) { localStorage.setItem(AUTH_KEY, 'true'); return true; } return false; }
function logout() { localStorage.removeItem(AUTH_KEY); window.location.href = 'login.html'; }
function requireAuth() { if (!isLoggedIn()) { window.location.href = 'login.html'; return false; } return true; }
