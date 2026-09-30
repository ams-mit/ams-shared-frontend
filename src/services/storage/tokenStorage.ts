const TOKEN_KEY = 'ams_auth_token';
const ACTIVE_USER_ID_KEY = 'ams_active_user_id';

export const tokenStorage = {
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },
  clearTokens: (): void => { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(ACTIVE_USER_ID_KEY); localStorage.removeItem('ams_auth_user'); },
  getUser: (): unknown => { try { return JSON.parse(localStorage.getItem('ams_auth_user') || 'null'); } catch { return null; } },
  setUser: (user: unknown): void => { localStorage.setItem('ams_auth_user', JSON.stringify(user)); },
  removeToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },
  getActiveUserId: (): string | null => {
    return localStorage.getItem(ACTIVE_USER_ID_KEY);
  },
  setActiveUserId: (userId: string): void => {
    localStorage.setItem(ACTIVE_USER_ID_KEY, userId);
  },
};
