const TOKEN_KEY = 'ams_auth_token';
const ACTIVE_USER_ID_KEY = 'ams_active_user_id';
const SESSION_USER_KEY = 'ams_session_user';

/**
 * Header segment of the tokens issued by the local sign-in (see authMockService): HS256, while
 * identity-access-service signs RS256, so the two never collide.
 */
export const DEMO_TOKEN_PREFIX = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.';

export const tokenStorage = {
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },
  removeToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },
  clearTokens: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ACTIVE_USER_ID_KEY);
    localStorage.removeItem(SESSION_USER_KEY);
  },
  /** True when signed in with offline demo data, whose token real services always reject. */
  isDemoSession: (): boolean => localStorage.getItem(TOKEN_KEY)?.startsWith(DEMO_TOKEN_PREFIX) ?? false,
  /** The signed-in user, kept so a page reload doesn't lose the session (refreshed via /auth/me). */
  getSessionUser: <T>(): T | null => {
    try {
      const raw = localStorage.getItem(SESSION_USER_KEY);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
  setSessionUser: (user: unknown): void => {
    localStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
  },
  getActiveUserId: (): string | null => {
    return localStorage.getItem(ACTIVE_USER_ID_KEY);
  },
  setActiveUserId: (userId: string): void => {
    localStorage.setItem(ACTIVE_USER_ID_KEY, userId);
  },
};
