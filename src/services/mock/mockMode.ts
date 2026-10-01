import { AxiosError, isAxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from '@/services/storage/tokenStorage';

/**
 * Data sources. By default every feature calls its real service through the gateway and only
 * falls back to the local data (kept in localStorage) when that service is unavailable.
 * VITE_USE_MOCK_DATA=true uses the local data only, without contacting any service.
 */
export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

/**
 * True when a call failed because the service could not do its job at all: no response, a
 * server error (5xx, including the gateway's 503 DEPENDENCY_UNAVAILABLE), or a route the gateway
 * doesn't have. Answers from a working service (validation, conflicts, permissions) are not.
 */
export const isServiceUnavailable = (err: unknown): boolean => {
  if (!isAxiosError(err)) return false;
  if (!err.response) return true;
  const { status, data } = err.response;
  const code = (data as { error?: { code?: unknown } } | undefined)?.error?.code;
  return status >= 500 || (status === 404 && code === 'ROUTE_NOT_FOUND');
};

/** Whether calls should go straight to the local data (local-only build, or a local sign-in). */
export const useLocalData = (): boolean => USE_MOCK_DATA || tokenStorage.isDemoSession();

/**
 * Wraps a feature API: each call goes to the real service first and to the matching local
 * implementation when the service is unavailable (or when signed in locally).
 */
export const withFallbackApi = <T extends Record<string, (...args: never[]) => Promise<unknown>>>(real: T, local: T): T =>
  Object.fromEntries(
    Object.keys(real).map((name) => [
      name,
      async (...args: never[]) => {
        if (useLocalData()) return local[name](...args);
        try {
          return await real[name](...args);
        } catch (err) {
          if (!isServiceUnavailable(err)) throw err;
          console.warn(`[data] ${name}: service unavailable, using local data.`);
          return local[name](...args);
        }
      },
    ])
  ) as T;

/** Clears everything the demo has saved in this browser, so it starts again from the seed data. */
export const resetDemoData = (): void => {
  Object.keys(localStorage)
    .filter((key) => key.startsWith('ams_'))
    .forEach((key) => localStorage.removeItem(key));
};

const randomBetween = (min: number, max: number) => min + Math.floor(Math.random() * (max - min));

/** Simulated network latency, so loading states show the way they would against a server. */
export const mockLatency = (min = 350, max = 750): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, randomBetween(min, max)));

/**
 * In mock mode a client never reaches the network: each request fails as "offline" after the
 * simulated latency. Feature APIs that keep a local copy (facilities, visitors, announcements)
 * then answer from localStorage through their existing offline fallback.
 */
export const applyMockAdapter = (client: AxiosInstance): void => {
  if (!USE_MOCK_DATA) return;
  client.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
    await mockLatency(250, 550);
    throw new AxiosError('Network Error', AxiosError.ERR_NETWORK, config);
  };
};
