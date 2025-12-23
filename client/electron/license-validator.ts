import { app } from 'electron';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import { getHardwareId } from './hardware-id';

const LICENSE_SECRET = process.env.LICENSE_SECRET || 'your-super-secret-jwt-key-change-this-to-something-very-long-and-random';
const LICENSE_SERVER_URL = process.env.LICENSE_SERVER_URL || 'http://localhost:3002';

interface LicensePayload {
    licenseKey: string;
    customerId: string;
    customerName: string;
    issuedAt: number;
    expiresAt: number;
    hardwareId: string;
    maxActivations: number;
    maxLocations: number;
    features: string[];
    version: string;
    type: 'trial' | 'full';
}

interface ValidationResult {
    isValid: boolean;
    daysRemaining?: number;
    error?: string;
}

/**
 * Get path to license file
 */
function getLicensePath(): string {
    const userDataPath = app.getPath('userData');
    return path.join(userDataPath, 'license.key');
}

/**
 * Get path to last online check timestamp
 */
function getLastCheckPath(): string {
    const userDataPath = app.getPath('userData');
    return path.join(userDataPath, 'license.check');
}

/**
 * Load license from disk
 */
export function loadLicenseFromDisk(): string | null {
    try {
        const licensePath = getLicensePath();
        if (fs.existsSync(licensePath)) {
            return fs.readFileSync(licensePath, 'utf8');
        }
        return null;
    } catch (error) {
        console.error('Error loading license:', error);
        return null;
    }
}

/**
 * Save license to disk (encrypted with simple XOR - for basic obfuscation)
 */
export function saveLicenseLocally(signedLicense: string): void {
    try {
        const licensePath = getLicensePath();

        // Simple XOR encryption for obfuscation
        const key = getHardwareId();
        const encrypted = xorEncrypt(signedLicense, key);

        fs.writeFileSync(licensePath, encrypted, 'utf8');
    } catch (error) {
        console.error('Error saving license:', error);
        throw error;
    }
}

/**
 * Simple XOR encryption/decryption
 */
function xorEncrypt(data: string, key: string): string {
    let result = '';
    for (let i = 0; i < data.length; i++) {
        result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return Buffer.from(result).toString('base64');
}

function xorDecrypt(encrypted: string, key: string): string {
    const data = Buffer.from(encrypted, 'base64').toString();
    let result = '';
    for (let i = 0; i < data.length; i++) {
        result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
}

/**
 * Get last online check date
 */
async function getLastOnlineCheckDate(): Promise<number> {
    try {
        const checkPath = getLastCheckPath();
        if (fs.existsSync(checkPath)) {
            const timestamp = fs.readFileSync(checkPath, 'utf8');
            return parseInt(timestamp);
        }
        return 0;
    } catch (error) {
        return 0;
    }
}

/**
 * Set last online check date
 */
async function setLastOnlineCheckDate(timestamp: number): Promise<void> {
    try {
        const checkPath = getLastCheckPath();
        fs.writeFileSync(checkPath, timestamp.toString());
    } catch (error) {
        console.error('Error saving check date:', error);
    }
}

/**
 * Validate license online
 */
async function validateLicenseOnline(licenseKey: string): Promise<boolean> {
    try {
        const response = await fetch(`${LICENSE_SERVER_URL}/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ licenseKey }),
            signal: AbortSignal.timeout(5000) // 5 second timeout
        });

        const data = await response.json() as { isValid: boolean };
        return data.isValid === true;
    } catch (error) {
        // If offline or server unreachable, allow grace period
        console.warn('Could not validate online, continuing offline:', error);
        return true;
    }
}

/**
 * Validate license (main function)
 */
export async function validateLicense(): Promise<ValidationResult> {
    const licenseData = loadLicenseFromDisk();

    if (!licenseData) {
        return { isValid: false, error: 'No license installed' };
    }

    try {
        // Decrypt license
        const hardwareId = getHardwareId();
        const decrypted = xorDecrypt(licenseData, hardwareId);

        // Verify JWT signature
        const decoded = jwt.verify(decrypted, LICENSE_SECRET) as LicensePayload;

        // Check hardware binding
        const currentHardwareId = getHardwareId();
        if (decoded.hardwareId !== currentHardwareId) {
            return { isValid: false, error: 'License bound to different device' };
        }

        // Check expiration
        const now = Date.now();
        if (now > decoded.expiresAt) {
            return { isValid: false, error: 'License expired' };
        }

        const daysRemaining = Math.ceil((decoded.expiresAt - now) / (1000 * 60 * 60 * 24));

        // Online validation every 30 days
        const lastCheck = await getLastOnlineCheckDate();
        const daysSinceLastCheck = Math.ceil((now - lastCheck) / (1000 * 60 * 60 * 24));

        if (daysSinceLastCheck > 30) {
            const onlineValid = await validateLicenseOnline(decoded.licenseKey);
            if (!onlineValid) {
                return { isValid: false, error: 'Online validation failed' };
            }
            await setLastOnlineCheckDate(now);
        }

        return { isValid: true, daysRemaining };

    } catch (error) {
        console.error('License validation error:', error);
        return { isValid: false, error: 'Invalid or corrupt license' };
    }
}

/**
 * Get license key from local storage (for display/renewal)
 */
export function getLicenseKey(): string | null {
    const licenseData = loadLicenseFromDisk();
    if (!licenseData) return null;

    try {
        const hardwareId = getHardwareId();
        const decrypted = xorDecrypt(licenseData, hardwareId);
        const decoded = jwt.verify(decrypted, LICENSE_SECRET) as LicensePayload;
        return decoded.licenseKey;
    } catch (error) {
        return null;
    }
}
