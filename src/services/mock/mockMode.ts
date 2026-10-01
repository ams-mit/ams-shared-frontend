import { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

/**
 * Demo build: every feature runs on mock data kept in the browser's localStorage, with a short
 * simulated network delay. On by default; set VITE_USE_MOCK_DATA=false to call the real
 * services through the gateway instead.
 */
export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== 'false';

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
