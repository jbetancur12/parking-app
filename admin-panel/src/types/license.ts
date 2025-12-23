export interface License {
    id: number;
    licenseKey: string;
    customerId: string;
    customerName: string;
    customerEmail: string;
    issuedAt: string;
    expiresAt: string;
    hardwareId?: string;
    activatedAt?: string;
    lastValidatedAt?: string;
    maxLocations: number;
    status: 'pending' | 'active' | 'expired' | 'revoked';
    type: 'trial' | 'full';
    createdAt: string;
    updatedAt: string;
}

export interface CreateLicenseDTO {
    customerName: string;
    customerEmail: string;
    type: 'trial' | 'full';
    months?: number;
    maxLocations?: number;
}

export interface DashboardStats {
    activeLicenses: number;
    expiringSoon: number;
    estimatedRevenue: number;
    totalClients: number;
}
