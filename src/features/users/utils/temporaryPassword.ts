const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz';
const DIGITS = '23456789';

const pick = (chars: string): string => chars.charAt(Math.floor(Math.random() * chars.length));

/**
 * Generates a one-time password that satisfies the identity-service policy
 * (8+ characters, at least one digit). Look-alike characters are excluded so it
 * can be read out or copied reliably.
 */
export const generateTemporaryPassword = (): string => {
  const chars = Array.from({ length: 7 }, () => pick(LETTERS + DIGITS));
  chars.splice(Math.floor(Math.random() * chars.length), 0, pick(DIGITS), pick(DIGITS));
  return `AMS-${chars.join('')}`;
};
