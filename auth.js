/* Auth — Google sign-in for the admin dashboard.
   No passwords anywhere in code: only the Google accounts listed
   below can access the dashboard. Requires the Firebase Auth compat
   SDK to be loaded (login.html and dashboard.html include it). */

const ALLOWED_ADMINS = [
  'torquemotorsportspk@gmail.com',
  'hasnshah85@gmail.com'
];

/* Short usernames for the password login. A username can stand for several
   allowlisted accounts: sign-in is tried against each in turn, so every
   admin uses the same username with their own password (set from the
   dashboard, "Set / change my password"). */
const ADMIN_USERNAMES = {
  torque: ['torquemotorsportspk@gmail.com', 'hasnshah85@gmail.com']
};

function resolveAdminEmails(identifier) {
  const id = (identifier || '').trim();
  if (id.includes('@')) return [id];
  return ADMIN_USERNAMES[id.toLowerCase()] || [id];
}

function adminAuth() {
  if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
  return firebase.auth();
}

function currentAdmin() {
  return new Promise((resolve) => {
    const unsub = adminAuth().onAuthStateChanged((user) => {
      unsub();
      if (user && ALLOWED_ADMINS.includes((user.email || '').toLowerCase())) {
        resolve(user);
      } else {
        resolve(null);
      }
    });
  });
}

async function isLoggedIn() {
  return !!(await currentAdmin());
}

async function loginWithGoogle() {
  const result = await adminAuth().signInWithPopup(new firebase.auth.GoogleAuthProvider());
  const email = (result.user?.email || '').toLowerCase();
  if (!ALLOWED_ADMINS.includes(email)) {
    await adminAuth().signOut();
    throw new Error('This Google account is not authorized for the dashboard.');
  }
  return result.user;
}

/* Email + password sign-in. Same allowlist as Google — a password only
   works for an admin account that set one via the dashboard. */
async function loginWithPassword(emailOrUsername, password) {
  let lastError = null;
  for (const email of resolveAdminEmails(emailOrUsername)) {
    try {
      const result = await adminAuth().signInWithEmailAndPassword(email, password);
      const em = (result.user?.email || '').toLowerCase();
      if (!ALLOWED_ADMINS.includes(em)) {
        await adminAuth().signOut();
        throw new Error('This account is not authorized for the dashboard.');
      }
      return result.user;
    } catch (e) {
      lastError = e;
      // Wrong password / no password on this account: try the next one.
      // Anything else (rate limit, network) stops here.
      const retryable = ['auth/wrong-password', 'auth/user-not-found', 'auth/invalid-credential', 'auth/invalid-login-credentials'];
      if (!(e && retryable.includes(e.code))) throw e;
    }
  }
  throw lastError || new Error('Wrong username or password.');
}

/* Called from the dashboard while signed in (with Google or password):
   sets/changes this admin's password. Firebase links a password credential
   to the same account, so the email allowlist and Firestore rules are
   untouched. */
async function setAdminPassword(newPassword) {
  const user = adminAuth().currentUser;
  if (!user) throw new Error('Sign in first.');
  if (!newPassword || newPassword.length < 8) {
    throw new Error('Password must be at least 8 characters.');
  }
  try {
    await user.updatePassword(newPassword);
  } catch (e) {
    if (e && e.code === 'auth/requires-recent-login') {
      throw new Error('For security, log out, sign in again, then set the password.');
    }
    throw e;
  }
}

function logout() {
  adminAuth().signOut().then(() => { window.location.href = 'login.html'; });
}

function requireAuth() {
  return isLoggedIn().then((ok) => {
    if (!ok) { window.location.href = 'login.html'; return false; }
    return true;
  });
}
