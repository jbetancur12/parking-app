import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function (context) {
    const serverPath = path.join(context.appOutDir, 'resources', 'server');

    console.log('Installing server dependencies in:', serverPath);

    // Check if server directory exists
    if (!fs.existsSync(serverPath)) {
        console.error('Server directory not found:', serverPath);
        return;
    }

    // Install production dependencies only
    try {
        execSync('npm install --production --legacy-peer-deps', {
            cwd: serverPath,
            stdio: 'inherit'
        });
        console.log('Server dependencies installed successfully');
    } catch (error) {
        console.error('Failed to install server dependencies:', error);
        throw error;
    }
}
