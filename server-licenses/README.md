# License Server - ParkingSof Desktop

API server for managing annual licenses for ParkingSof Electron desktop application.

## Setup

### 1. Install Dependencies
```bash
cd server-licenses
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env and configure your PostgreSQL connection
```

### 3. Generate Secrets
```bash
# Generate LICENSE_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"

# Generate ADMIN_API_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Create Database
```bash
# In PostgreSQL
createdb licenses_db
```

### 5. Run Migrations
```bash
npm run build
npm start
# OR for development
npm run dev
```

## API Endpoints

### POST /activate
Activate a license with hardware binding.

**Request:**
```json
{
  "licenseKey": "PARK-XXXX-XXXX-XXXX-XXXX",
  "hardwareId": "abc123..."
}
```

**Response:**
```json
{
  "signedLicense": "eyJhbGciOi...",
  "expiresAt": "2025-12-21T00:00:00.000Z"
}
```

### POST /validate
Validate if a license is still active.

**Request:**
```json
{
  "licenseKey": "PARK-XXXX-XXXX-XXXX-XXXX"
}
```

**Response:**
```json
{
  "isValid": true,
  "expiresAt": "2025-12-21T00:00:00.000Z",
  "daysRemaining": 120
}
```

### POST /trial
Generate a 14-day trial license.

**Request:**
```json
{
  "hardwareId": "abc123..."
}
```

**Response:**
```json
{
  "signedLicense": "eyJhbGciOi...",
  "licenseKey": "PARK-XXXX-XXXX-XXXX-XXXX",
  "expiresAt": "2025-01-04T00:00:00.000Z"
}
```

## Development

```bash
npm run dev  # Start with hot reload
npm run build  # Build TypeScript
npm start  # Run production build
```

## Todo
- [ ] Admin endpoints (create, revoke, renew licenses)
- [ ] Email notifications
- [ ] Admin panel frontend
