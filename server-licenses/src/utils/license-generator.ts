import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { License } from '../entities/License';

const LICENSE_SECRET = process.env.LICENSE_SECRET || 'change-this-secret';

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

export function generateLicenseKey(): string {
    const segments = [];
    for (let i = 0; i < 4; i++) {
        const segment = crypto.randomBytes(2).toString('hex').toUpperCase().slice(0, 4);
        segments.push(segment);
    }
    return `PARK-${segments.join('-')}`;
}

export function signLicense(license: License, hardwareId: string = ''): string {
    const payload: LicensePayload = {
        licenseKey: license.licenseKey,
        customerId: license.customerId,
        customerName: license.customerName,
        issuedAt: license.issuedAt.getTime(),
        expiresAt: license.expiresAt.getTime(),
        hardwareId,
        maxActivations: 1,
        maxLocations: license.maxLocations,
        features: license.features,
        version: '1.0.0',
        type: license.type
    };

    return jwt.sign(payload, LICENSE_SECRET, { algorithm: 'HS256' });
}

export function verifyLicense(token: string): LicensePayload | null {
    try {
        return jwt.verify(token, LICENSE_SECRET) as LicensePayload;
    } catch (error) {
        return null;
    }
}
