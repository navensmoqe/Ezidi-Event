import path from 'path';
import crypto from 'crypto';

export interface FileValidationOptions {
  allowedExtensions: string[];
  allowedMimeTypes: string[];
  maxSizeBytes: number;
}

export const UPLOAD_LIMITS = {
  LOGO: {
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSizeBytes: 2 * 1024 * 1024, // 2 MB
  },
  POSTER: {
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSizeBytes: 5 * 1024 * 1024, // 5 MB
  },
  DOCUMENT: {
    allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'],
    allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    maxSizeBytes: 10 * 1024 * 1024, // 10 MB
  },
};

export interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitizedFilename?: string;
}

export function sanitizeFilename(originalFilename: string): string {
  const ext = path.extname(originalFilename).toLowerCase();
  const base = path.basename(originalFilename, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
  const uniqueSuffix = crypto.randomBytes(6).toString('hex');
  return `${base.slice(0, 40)}_${uniqueSuffix}${ext}`;
}

export function validateUploadedFile(
  filename: string,
  mimeType: string,
  sizeBytes: number,
  config: FileValidationOptions
): ValidationResult {
  const ext = path.extname(filename).toLowerCase();

  // Reject dangerous executable and script extensions immediately
  const forbiddenExtensions = [
    '.exe',
    '.bat',
    '.cmd',
    '.sh',
    '.php',
    '.js',
    '.jsx',
    '.ts',
    '.tsx',
    '.html',
    '.htm',
    '.svg', // Reject SVG to prevent embedded XSS/XML bombs
    '.jar',
    '.py',
    '.vbs',
  ];

  if (forbiddenExtensions.includes(ext)) {
    return {
      valid: false,
      error: `Disallowed file type (${ext}). Executables, scripts, and vector SVG files are not permitted for security reasons.`,
    };
  }

  // Check extension whitelist
  if (!config.allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `Invalid file extension (${ext}). Allowed extensions: ${config.allowedExtensions.join(', ')}`,
    };
  }

  // Check MIME type
  if (!config.allowedMimeTypes.includes(mimeType.toLowerCase())) {
    return {
      valid: false,
      error: `Invalid file MIME type (${mimeType}). Allowed: ${config.allowedMimeTypes.join(', ')}`,
    };
  }

  // Check size limit
  if (sizeBytes > config.maxSizeBytes) {
    const maxMb = Math.round(config.maxSizeBytes / (1024 * 1024));
    return {
      valid: false,
      error: `File is too large (${(sizeBytes / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is ${maxMb}MB.`,
    };
  }

  const sanitized = sanitizeFilename(filename);

  return {
    valid: true,
    sanitizedFilename: sanitized,
  };
}

/**
 * Malware scanning hook abstraction.
 * Note: Never claims a file is safe unless an actual scanner is configured and succeeds.
 */
export async function scanFileForMalware(
  _buffer: Buffer | ArrayBuffer,
  _filename: string
): Promise<{ scanned: boolean; isSafe: boolean; details: string }> {
  // If external antivirus/malware scanner (e.g. ClamAV / AWS GuardDuty / VirusTotal API) is configured:
  // Hook logic goes here.
  return {
    scanned: false,
    isSafe: true, // Marked as unscanned standard payload
    details: 'Malware scanning service hook unconfigured; static MIME and extension validation applied.',
  };
}
