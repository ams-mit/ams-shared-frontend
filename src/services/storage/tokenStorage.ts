const TOKEN_KEY = 'ams_auth_token';
const ACTIVE_USER_ID_KEY = 'ams_active_user_id';

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
  getActiveUserId: (): string | null => {
    return localStorage.getItem(ACTIVE_USER_ID_KEY);
  },
  setActiveUserId: (userId: string): void => {
    localStorage.setItem(ACTIVE_USER_ID_KEY, userId);
  },
};
