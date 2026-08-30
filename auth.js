/* Auth — Google sign-in for the admin dashboard.
   No passwords anywhere in code: only the Google accounts listed
   below can access the dashboard. Requires the Firebase Auth compat
   SDK to be loaded (login.html and dashboard.html include it). */

const ALLOWED_ADMINS = [
  'torquemotorsportspk@gmail.com',
  'hasnshah85@gmail.com'
];

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

function logout() {
  adminAuth().signOut().then(() => { window.location.href = 'login.html'; });
}

function requireAuth() {
  return isLoggedIn().then((ok) => {
    if (!ok) { window.location.href = 'login.html'; return false; }
    return true;
  });
}
