import { createHmac, timingSafeEqual } from 'crypto';

const TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes

function createSignature(password: string, expiresAt: number) {
  return createHmac('sha256', password).update(String(expiresAt)).digest('hex');
}

export function generateAdminToken(password: string) {
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const signature = createSignature(password, expiresAt);
  return `${expiresAt}:${signature}`;
}

export function verifyAdminToken(token: string, password: string) {
  if (!token.includes(':')) return false;

  const [expiresAtPart, signature] = token.split(':');
  const expiresAt = Number(expiresAtPart);
  if (!expiresAt || expiresAt < Date.now()) {
    return false;
  }

  const expectedSignature = createSignature(password, expiresAt);
  const expectedBuffer = Buffer.from(expectedSignature, 'hex');
  const providedBuffer = Buffer.from(signature || '', 'hex');

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, providedBuffer);
}
