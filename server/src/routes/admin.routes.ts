import { Router } from 'express';
import { requireRole } from '../middleware/permission.middleware';
import { UserRole } from '../entities/User';
import {
    createTenant,
    getAllTenants,
    getTenantById,
    updateTenant,
    updateTenantStatus,
} from '../controllers/admin/tenant.controller';
import {
    createLocation,
    getAllLocations,
    getLocationById,
    updateLocation,
    deleteLocation,
} from '../controllers/admin/location.controller';
import {
    assignUserToTenants,
    getUserTenants,
    removeUserFromTenant,
} from '../controllers/admin/user-tenant.controller';
import {
    getFeatures,
    createFeature,
    updateFeature,
    deleteFeature
} from '../controllers/admin/feature.controller';
import {
    getDashboardMetrics,
    getChurnMetrics,
    getLTVMetrics,
    getActiveUsage,
    getTrends
} from '../controllers/admin/dashboard.controller';
import adminBillingRoutes from './admin/billing.routes';
import adminPricingRoutes from './admin/pricing.routes';

const router = Router();

// All admin routes require SUPER_ADMIN role
// Tenant routes (SuperAdmin Only)
router.post('/tenants', requireRole([UserRole.SUPER_ADMIN]), createTenant);
router.get('/tenants', requireRole([UserRole.SUPER_ADMIN]), getAllTenants);
router.get('/tenants/:id', requireRole([UserRole.SUPER_ADMIN]), getTenantById);
router.put('/tenants/:id', requireRole([UserRole.SUPER_ADMIN]), updateTenant);
router.patch('/tenants/:id/status', requireRole([UserRole.SUPER_ADMIN]), updateTenantStatus);

// Location routes (SuperAdmin, Admin, LocationManager)
// Admin restricted to tenant, LocationManager restricted to assigned locations
router.post('/locations', requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]), createLocation); // Only Admin/SuperAdmin can CREATE
router.get('/locations', requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.LOCATION_MANAGER]), getAllLocations);
router.get('/locations/:id', requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.LOCATION_MANAGER]), getLocationById);
router.put('/locations/:id', requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.LOCATION_MANAGER]), updateLocation);
router.delete('/locations/:id', requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]), deleteLocation); // Only Admin/SuperAdmin can DELETE

// User-Tenant assignment routes (SuperAdmin AND Admin)
router.post('/users/:userId/tenants', requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]), assignUserToTenants);
router.get('/users/:userId/tenants', requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]), getUserTenants);
router.delete('/users/:userId/tenants/:tenantId', requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]), removeUserFromTenant);

// Billing routes (SuperAdmin only)
router.use('/billing', adminBillingRoutes);

// Pricing routes (SuperAdmin only)
router.use('/pricing', adminPricingRoutes);

// Feature Definition routes (SuperAdmin only)
router.get('/features', requireRole([UserRole.SUPER_ADMIN]), getFeatures);
router.post('/features', requireRole([UserRole.SUPER_ADMIN]), createFeature);
router.put('/features/:id', requireRole([UserRole.SUPER_ADMIN]), updateFeature);
router.delete('/features/:id', requireRole([UserRole.SUPER_ADMIN]), deleteFeature);

// Dashboard metrics routes (SuperAdmin only)
router.get('/dashboard/metrics', requireRole([UserRole.SUPER_ADMIN]), getDashboardMetrics);
router.get('/dashboard/churn', requireRole([UserRole.SUPER_ADMIN]), getChurnMetrics);
router.get('/dashboard/ltv', requireRole([UserRole.SUPER_ADMIN]), getLTVMetrics);
router.get('/dashboard/active-usage', requireRole([UserRole.SUPER_ADMIN]), getActiveUsage);
router.get('/dashboard/trends', requireRole([UserRole.SUPER_ADMIN]), getTrends);

export default router;
