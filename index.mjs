/**
 * Canonical TwoTune Google Auth (provider popup, linking, collision parsing).
 * Consumed via npm dependency by Web and Collection — do not copy this file into app repos.
 * Firebase SDK bindings are injected; this module does not import Firebase.
 */

/** Diagnostics only — keep equal to package.json "version". */
export const CANONICAL_GOOGLE_AUTH_VERSION = '1.0.0';

export const GOOGLE_AUTH_ENABLED = true;

export const GOOGLE_AUTH_QA_QUERY_KEY = 'googleAuthQa';

export const GOOGLE_AUTH_QA_FIXED_HOST = 'google-qa.twotune.com';

export const GOOGLE_AUTH_PRODUCTION_HOSTS = [
  'twotune.com',
  'www.twotune.com',
  'preview.twotune.com',
  'collection.twotune.com',
];

function normalizeGoogleQaHostname(hostname) {
  return typeof hostname === 'string' ? hostname.trim().toLowerCase() : '';
}

export function isLocalGoogleQaHost(hostname) {
  const h = normalizeGoogleQaHostname(hostname);
  return h === 'localhost' || h === '127.0.0.1';
}

export function isAllowedGoogleAuthQaHost(hostname) {
  const h = normalizeGoogleQaHostname(hostname);
  return h === 'localhost' || h === '127.0.0.1' || h === GOOGLE_AUTH_QA_FIXED_HOST;
}

export function readGoogleAuthQaOptInFromSearch(search) {
  try {
    const raw = typeof search === 'string' ? search : '';
    const params = new URLSearchParams(raw.startsWith('?') ? raw : raw ? `?${raw}` : '');
    return params.get(GOOGLE_AUTH_QA_QUERY_KEY) === '1';
  } catch (_) {
    return false;
  }
}

export function isGoogleAuthProductionHost(hostname) {
  const h = normalizeGoogleQaHostname(hostname);
  return GOOGLE_AUTH_PRODUCTION_HOSTS.indexOf(h) >= 0;
}

export function isGoogleSignInEnabledForHost(hostname, search) {
  if (GOOGLE_AUTH_ENABLED !== true) {
    if (!isAllowedGoogleAuthQaHost(hostname)) return false;
    return readGoogleAuthQaOptInFromSearch(search);
  }
  if (isGoogleAuthProductionHost(hostname)) return true;
  const h = normalizeGoogleQaHostname(hostname);
  if (h === GOOGLE_AUTH_QA_FIXED_HOST) {
    return readGoogleAuthQaOptInFromSearch(search);
  }
  if (isLocalGoogleQaHost(hostname)) {
    return readGoogleAuthQaOptInFromSearch(search);
  }
  return false;
}

export function isGoogleAuthEnabledForHost(hostname, search) {
  return isGoogleSignInEnabledForHost(hostname, search);
}

/**
 * @param {object} deps Firebase Auth modular API bindings from the host app SDK.
 */
export function createTwotuneGoogleAuth(deps) {
  const {
    GoogleAuthProvider,
    signInWithPopup,
    linkWithPopup,
    linkWithCredential,
    signInWithEmailAndPassword,
    browserPopupRedirectResolver,
  } = deps;

  function createGoogleAuthProvider() {
    return new GoogleAuthProvider();
  }

  function parseGoogleAccountCollision(error) {
    if (!error || error.code !== 'auth/account-exists-with-different-credential') {
      return null;
    }
    const pendingCredential = GoogleAuthProvider.credentialFromError(error);
    const email =
      error.customData && typeof error.customData.email === 'string'
        ? error.customData.email.trim()
        : '';
    if (!pendingCredential || !email) return null;
    return { email, pendingCredential };
  }

  async function signInWithGooglePopup(auth, hooks) {
    const provider = createGoogleAuthProvider();
    const credential = await signInWithPopup(auth, provider, browserPopupRedirectResolver);
    if (hooks && typeof hooks.afterSuccess === 'function') {
      hooks.afterSuccess(credential);
    }
    return credential;
  }

  async function linkGoogleToSignedInUser(auth, hooks) {
    const user = auth.currentUser;
    if (!user) {
      const err = new Error('not-authenticated');
      err.code = 'auth/no-current-user';
      throw err;
    }
    const uidBeforeLink = user.uid;
    const provider = createGoogleAuthProvider();
    const linked = await linkWithPopup(user, provider, browserPopupRedirectResolver);
    if (!linked.user || linked.user.uid !== uidBeforeLink) {
      const err = new Error('uid-changed-during-link');
      err.code = 'auth/uid-changed-during-link';
      throw err;
    }
    if (hooks && typeof hooks.afterSuccess === 'function') {
      hooks.afterSuccess(linked);
    }
    return linked;
  }

  async function signInExistingAndLinkGoogle(auth, email, password, pendingGoogleCredential, hooks) {
    if (!pendingGoogleCredential) {
      const err = new Error('missing-google-credential');
      err.code = 'auth/missing-google-credential';
      throw err;
    }
    const normalizedEmail = typeof email === 'string' ? email.trim() : '';
    if (!normalizedEmail || !password) {
      const err = new Error('missing-password-link-fields');
      err.code = 'auth/missing-password-link-fields';
      throw err;
    }
    const signInCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
    const uidBeforeLink = signInCredential.user.uid;
    const linked = await linkWithCredential(signInCredential.user, pendingGoogleCredential);
    if (linked.user.uid !== uidBeforeLink) {
      const err = new Error('uid-changed-during-link');
      err.code = 'auth/uid-changed-during-link';
      throw err;
    }
    if (hooks && typeof hooks.afterSuccess === 'function') {
      hooks.afterSuccess(linked);
    }
    return linked;
  }

  return {
    createGoogleAuthProvider,
    parseGoogleAccountCollision,
    signInWithGooglePopup,
    linkGoogleToSignedInUser,
    signInExistingAndLinkGoogle,
  };
}

export function googlePopupErrorKind(error) {
  const code = error && error.code ? String(error.code) : '';
  if (
    code === 'auth/popup-closed-by-user' ||
    code === 'auth/cancelled-popup-request'
  ) {
    return 'cancelled';
  }
  if (code === 'auth/popup-blocked') {
    return 'popup-blocked';
  }
  return 'failed';
}
