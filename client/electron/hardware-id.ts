import { app } from 'electron';
import { machineIdSync } from 'node-machine-id';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

/**
 * Get a unique hardware ID for this machine
 * Uses node-machine-id with fallback to generated ID
 */
export function getHardwareId(): string {
    try {
        // Get original machine ID (more stable than hashed)
        const machineId = machineIdSync(true);

        // Hash it for privacy/obfuscation
        return crypto.createHash('sha256').update(machineId).digest('hex').slice(0, 16);
    } catch (error) {
        console.error('Error getting hardware ID:', error);
        return getOrCreateFallbackId();
    }
}

/**
 * Generate and persist a fallback hardware ID if machine-id fails
 */
function getOrCreateFallbackId(): string {
    const userDataPath = app.getPath('userData');
    const machineIdPath = path.join(userDataPath, 'machine.id');

    // Check if fallback ID already exists
    if (fs.existsSync(machineIdPath)) {
        return fs.readFileSync(machineIdPath, 'utf8');
    }

    // Generate new fallback ID
    const newId = crypto.randomBytes(16).toString('hex');
    fs.writeFileSync(machineIdPath, newId);
    return newId;
}
