import * as OTPAuth from 'otpauth';
import crypto from 'crypto';

export interface TwoFactorSetup {
  secret: string;
  uri: string;
  backupCodes: string[];
}

export function generateTwoFactorSecret(userEmail: string): TwoFactorSetup {
  const secret = new OTPAuth.Secret({ size: 20 });
  const totp = new OTPAuth.TOTP({
    issuer: 'Ezidi Events Worldwide',
    label: userEmail,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: secret,
  });

  // Generate 8 cryptographically secure alphanumeric backup codes
  const backupCodes: string[] = [];
  for (let i = 0; i < 8; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    backupCodes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }

  return {
    secret: secret.base32,
    uri: totp.toString(),
    backupCodes,
  };
}

export function verifyTwoFactorToken(token: string, secretBase32: string): boolean {
  if (!token || !secretBase32) return false;

  const totp = new OTPAuth.TOTP({
    issuer: 'Ezidi Events Worldwide',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secretBase32),
  });

  // Allows 1 window margin (30 seconds before/after)
  const delta = totp.validate({ token: token.trim(), window: 1 });
  return delta !== null;
}

export function hashBackupCode(code: string): string {
  return crypto.createHash('sha256').update(code.trim().toUpperCase()).digest('hex');
}

export function verifyAndConsumeBackupCode(
  inputCode: string,
  storedHashedCodes: string[]
): { valid: boolean; remainingCodes: string[] } {
  const inputHash = hashBackupCode(inputCode);
  const codeIndex = storedHashedCodes.indexOf(inputHash);

  if (codeIndex === -1) {
    return { valid: false, remainingCodes: storedHashedCodes };
  }

  const remainingCodes = [...storedHashedCodes];
  remainingCodes.splice(codeIndex, 1);
  return { valid: true, remainingCodes };
}
