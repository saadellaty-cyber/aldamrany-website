import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from 'node:crypto';
import { promisify } from 'node:util';

// `promisify` resolves to the overload without options; name the signature we
// actually use so the cost parameters can be passed through.
const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: ScryptOptions,
) => Promise<Buffer>;

/**
 * scrypt parameters. N=2^15 with r=8 keeps hashing around 100ms on typical
 * server hardware, which is a sensible cost for an admin login form.
 */
const N = 32_768;
const R = 8;
const P = 1;
const KEY_LENGTH = 64;
const MAX_MEM = 160 * 1024 * 1024;

/**
 * Hashes a password into a self-describing string:
 *   scrypt$N$r$p$<salt base64>$<derived key base64>
 * Storing the parameters allows them to be raised later without invalidating
 * existing hashes.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scryptAsync(password.normalize('NFKC'), salt, KEY_LENGTH, {
    N,
    r: R,
    p: P,
    maxmem: MAX_MEM,
  });

  return ['scrypt', N, R, P, salt.toString('base64'), derived.toString('base64')].join('$');
}

/** Constant-time verification of a password against a stored hash. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;

  const [, nRaw, rRaw, pRaw, saltRaw, hashRaw] = parts;
  const n = Number(nRaw);
  const r = Number(rRaw);
  const p = Number(pRaw);
  if (!Number.isInteger(n) || !Number.isInteger(r) || !Number.isInteger(p)) return false;

  const salt = Buffer.from(saltRaw, 'base64');
  const expected = Buffer.from(hashRaw, 'base64');

  try {
    const derived = await scryptAsync(password.normalize('NFKC'), salt, expected.length, {
      N: n,
      r,
      p,
      maxmem: MAX_MEM,
    });
    return derived.length === expected.length && timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

/**
 * Minimum policy for administrator passwords. Deliberately length-first rather
 * than a thicket of character-class rules.
 */
export function validatePasswordStrength(password: string): string | null {
  if (password.length < 12) return 'Password must be at least 12 characters long.';
  if (password.length > 200) return 'Password must be at most 200 characters long.';
  if (!/[a-zA-Z]/.test(password)) return 'Password must contain at least one letter.';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number.';
  return null;
}
