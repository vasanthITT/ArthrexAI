// ===== ARTHREX AI — AUTH & ACCESS CONTROL =====
// FIX: Removed dead code block after handleSignup, removed duplicate setTimeout init,
//      removed double event listener registration, added admin panel guard,
//      welcome banner now shows logged-in user name dynamically.

const DEMO_USERS = {
  'user@arthrex.ai':  { password: 'user123',  role: 'user',  name: 'User' },
  'admin@arthrex.ai': { password: 'admin123', role: 'admin', name: 'Admin' },
};

let selectedRole = 'user';
let _authInitialized = false; // FIX: prevent double-init

// ── Simple hash for localStorage passwords (not cryptographic, just obfuscation) ──
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'h_' + Math.abs(hash).toString(36);
}

// ── Session helpers ───────────────────────────────────────────────────────────
function getSession() {
  try {
    return JSON.parse(localStorage.getItem('aai_session') || 'null');
  } catch (e) {
    return null;
  }
}

function saveSession(data) {
  try {
    localStorage.setItem('aai_session', JSON.stringify(data));
  } catch (e) {
    console.error('Error saving session:', e);
  }
}

function clearSession() {
  try {
    localStorage.removeItem('aai_session');
  } catch (e) {
    console.error('Error clearing session:', e);
  }
}

function isAdmin() {
  const s = getSession();
  return s && s.role === 'admin';
}

function isLoggedIn() {
  return !!getSession();
}

function selectRole(role) {
  selectedRole = role;
  const roleUser = document.getElementById('roleUser');
  const roleAdmin = document.getElementById('roleAdmin');
  if (roleUser) roleUser.classList.toggle('active', role === 'user');
  if (roleAdmin) roleAdmin.classList.toggle('active', role === 'admin');
}

// ── Modal functions ───────────────────────────────────────────────────────────
function openLoginModal() {
  try {
    const authError = document.getElementById('authError');
    const signupError = document.getElementById('signupError');
    const authEmail = document.getElementById('auth_email');
    const authPassword = document.getElementById('auth_password');
    const loginModal = document.getElementById('loginModal');
    if (authError) authError.style.display = 'none';
    if (signupError) signupError.style.display = 'none';
    if (authEmail) authEmail.value = '';
    if (authPassword) authPassword.value = '';
    selectRole('user');
    switchAuthTab('signup');
    if (loginModal) loginModal.classList.add('active');
  } catch (e) {
    console.error('Error opening login modal:', e);
  }
}

function closeLoginModal() {
  try {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) loginModal.classList.remove('active');
  } catch (e) {
    console.error('Error closing login modal:', e);
  }
}

function switchAuthTab(tab) {
  try {
    const isSignup = tab === 'signup';
    const tabSignup = document.getElementById('tabSignup');
    const tabLogin = document.getElementById('tabLogin');
    const formSignup = document.getElementById('formSignup');
    const formLogin = document.getElementById('formLogin');
    if (tabSignup) tabSignup.classList[isSignup ? 'add' : 'remove']('active');
    if (tabLogin) tabLogin.classList[isSignup ? 'remove' : 'add']('active');
    if (formSignup) formSignup.style.cssText = isSignup ? 'display:flex;flex-direction:column;gap:14px' : 'display:none';
    if (formLogin) formLogin.style.cssText = isSignup ? 'display:none' : 'display:flex;flex-direction:column;gap:14px';
    const signupError = document.getElementById('signupError');
    const authError = document.getElementById('authError');
    if (signupError) signupError.style.display = 'none';
    if (authError) authError.style.display = 'none';
  } catch (e) {
    console.error('Error switching auth tab:', e);
  }
}

// ── Login handler ─────────────────────────────────────────────────────────────
async function handleLogin() {
  const emailEl    = document.getElementById('auth_email');
  const passwordEl = document.getElementById('auth_password');
  const errEl      = document.getElementById('authError');
  const btnSubmit  = document.getElementById('btnAuthSubmit');
  if (!emailEl || !passwordEl || !errEl) return;

  const email    = emailEl.value.trim().toLowerCase();
  const password = passwordEl.value;

  if (!email || !password) {
    errEl.textContent = '❌ Please enter email and password.';
    errEl.style.display = 'block';
    return;
  }

  // Check demo users first
  const demoMatch = DEMO_USERS[email];
  if (demoMatch && demoMatch.password === password) {
    saveSession({ email, role: demoMatch.role, name: demoMatch.name });
    closeLoginModal();
    applyAccessControl();
    return;
  }

  // Try Flask backend
  if (btnSubmit) { btnSubmit.textContent = 'Signing in...'; btnSubmit.disabled = true; }
  try {
    const res = await apiLogin(email, password);
    if (res.ok) {
      saveSession({ email, role: res.data.role, name: res.data.name });
      closeLoginModal();
      applyAccessControl();
      return;
    }
    if (res.error !== 'server_unreachable') {
      errEl.textContent = '❌ ' + (res.error || 'Invalid email or password.');
      errEl.style.display = 'block';
      return;
    }
  } finally {
    if (btnSubmit) { btnSubmit.textContent = 'Sign In'; btnSubmit.disabled = false; }
  }

  // localStorage fallback — FIX: compare hashed passwords
  const signups = JSON.parse(localStorage.getItem('aai_signups') || '[]');
  const hashedInput = simpleHash(password);
  const regUser = signups.find(s => s.email === email && (s.passwordHash === hashedInput || s.password === password));
  if (regUser) {
    saveSession({ email, role: 'user', name: regUser.name });
    closeLoginModal();
    applyAccessControl();
    return;
  }

  errEl.textContent = '❌ Invalid email or password.';
  errEl.style.display = 'block';
}

// ── Signup handler ────────────────────────────────────────────────────────────
async function handleSignup() {
  const nameEl     = document.getElementById('signup_name');
  const emailEl    = document.getElementById('signup_email');
  const countryEl  = document.getElementById('signup_country');
  const phoneEl    = document.getElementById('signup_phone');
  const passwordEl = document.getElementById('signup_password');
  const errEl      = document.getElementById('signupError');
  const btnSubmit  = document.getElementById('btnSignupSubmit');

  if (!nameEl || !emailEl || !phoneEl || !passwordEl || !errEl) return;

  const name     = nameEl.value.trim();
  const email    = emailEl.value.trim().toLowerCase();
  const country  = countryEl ? countryEl.value : '';
  const phone    = phoneEl.value.trim();
  const password = passwordEl.value;

  if (!name || !email || !phone || !password) {
    errEl.textContent = '❌ Please fill in all fields.'; errEl.style.display = 'block'; return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errEl.textContent = '❌ Please enter a valid email address.'; errEl.style.display = 'block'; return;
  }
  if (!/^\d{6,15}$/.test(phone)) {
    errEl.textContent = '❌ Please enter a valid phone number (6–15 digits).'; errEl.style.display = 'block'; return;
  }
  if (password.length < 6) {
    errEl.textContent = '❌ Password must be at least 6 characters.'; errEl.style.display = 'block'; return;
  }

  if (btnSubmit) { btnSubmit.textContent = 'Creating account...'; btnSubmit.disabled = true; }
  try {
    const res = await apiSignup(name, email, password, country, phone);
    if (res.ok) {
      saveSession({ email, role: 'user', name });
      // Always write to aai_signups so admin Sign Up Dashboard sees it
      // (works whether data went to Flask DB or localStorage fallback)
      const signups = JSON.parse(localStorage.getItem('aai_signups') || '[]');
      if (!signups.find(s => s.email === email)) {
        signups.push({
          id: Date.now(), name, email,
          phone: (countryEl ? countryEl.value : '') + ' ' + phone,
          country: countryEl ? countryEl.value : '',
          date: new Date().toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'}),
          time: new Date().toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'})
        });
        localStorage.setItem('aai_signups', JSON.stringify(signups));
      }
      closeLoginModal();
      applyAccessControl();
      if (typeof showToast === 'function') showToast('Welcome to Arthrex AI, ' + name + '!', 'success');
    } else {
      errEl.textContent = '❌ ' + (res.error || 'Signup failed. Please try again.');
      errEl.style.display = 'block';
    }
  } catch (e) {
    errEl.textContent = '❌ Signup failed. Please try again.';
    errEl.style.display = 'block';
  } finally {
    if (btnSubmit) { btnSubmit.textContent = '🚀 Join Arthrex AI'; btnSubmit.disabled = false; }
  }
}

// ── Logout handler ────────────────────────────────────────────────────────────
function handleLogout() {
  clearSession();
  applyAccessControl();
}

// ── Apply access control ──────────────────────────────────────────────────────
function applyAccessControl() {
  try {
    const session = getSession();
    const loggedIn = !!session;
    const admin = loggedIn && session.role === 'admin';

    const btnLogin  = document.getElementById('btnLogin');
    const userAvatar = document.getElementById('userAvatar');
    const btnLogout = document.getElementById('btnLogout');

    if (btnLogin)   btnLogin.style.display   = loggedIn ? 'none' : 'flex';
    if (userAvatar) userAvatar.style.display = loggedIn ? 'flex' : 'none';
    if (btnLogout)  btnLogout.style.display  = loggedIn ? 'flex' : 'none';

    if (loggedIn && session.name) {
      const initials = session.name.slice(0, 2).toUpperCase();
      if (userAvatar) {
        userAvatar.textContent = initials;
        userAvatar.title = `${session.name} (${session.role})`;
        userAvatar.className = 'user-avatar' + (admin ? ' avatar-admin' : ' avatar-user');
      }
      // FIX: Update welcome banner with real user name
      const welcomeName = document.querySelector('.welcome-banner .gradient-text');
      if (welcomeName) welcomeName.textContent = session.name + '!';
      const welcomeLabel = document.querySelector('.welcome-label');
      const hour = new Date().getHours();
      const greeting = hour < 12 ? 'Good Morning 👋' : hour < 17 ? 'Good Afternoon 👋' : 'Good Evening 👋';
      if (welcomeLabel) welcomeLabel.textContent = greeting;
    }

    // FIX: Hide admin panel link for non-admins (was using wrong class .admin-link-btn)
    const adminLinkBtn = document.querySelector('.admin-link-btn');
    if (adminLinkBtn) adminLinkBtn.style.display = admin ? 'flex' : 'none';

    const adminNavLink = document.querySelector('.admin-link');
    if (adminNavLink) adminNavLink.style.display = admin ? 'flex' : 'none';

    const manageBtn = document.querySelector('.btn-manage-courses');
    if (manageBtn) manageBtn.style.display = admin ? 'inline-flex' : 'none';

    const emptyAdminLink = document.getElementById('emptyAdminLink');
    if (emptyAdminLink) emptyAdminLink.style.display = admin ? 'inline-flex' : 'none';

    document.querySelectorAll('.btn-edit-course').forEach(btn => {
      btn.style.display = admin ? 'inline-flex' : 'none';
    });
  } catch (e) {
    console.error('Error applying access control:', e);
  }
}

// ── Initialize all handlers — FIX: only run once ──────────────────────────────
function initializeAuth() {
  if (_authInitialized) return;
  _authInitialized = true;

  try {
    const btnLogin = document.getElementById('btnLogin');
    if (btnLogin) btnLogin.addEventListener('click', openLoginModal);

    const closeLoginModalBtn = document.getElementById('closeLoginModal');
    if (closeLoginModalBtn) closeLoginModalBtn.addEventListener('click', closeLoginModal);

    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
      loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) closeLoginModal();
      });
    }

    const btnAuthSubmit = document.getElementById('btnAuthSubmit');
    if (btnAuthSubmit) btnAuthSubmit.addEventListener('click', handleLogin);

    const btnSignupSubmit = document.getElementById('btnSignupSubmit');
    if (btnSignupSubmit) btnSignupSubmit.addEventListener('click', handleSignup);

    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) btnLogout.addEventListener('click', handleLogout);

    applyAccessControl();
    console.log('✅ Auth initialized');
  } catch (e) {
    console.error('❌ Error initializing auth:', e);
  }
}

// ── Initialize when DOM is ready — FIX: single init, no setTimeout duplicate ──
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAuth);
} else {
  initializeAuth();
}
