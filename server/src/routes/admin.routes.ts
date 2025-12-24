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

const router = Router();

// All admin routes require SUPER_ADMIN role
// Tenant routes (SuperAdmin Only)
router.post('/tenants', requireRole([UserRole.SUPER_ADMIN]), createTenant);
router.get('/tenants', requireRole([UserRole.SUPER_ADMIN]), getAllTenants);
router.get('/tenants/:id', requireRole([UserRole.SUPER_ADMIN]), getTenantById);
router.put('/tenants/:id', requireRole([UserRole.SUPER_ADMIN]), updateTenant);
router.patch('/tenants/:id/status', requireRole([UserRole.SUPER_ADMIN]), updateTenantStatus);

// Location routes (SuperAdmin AND Admin)
// Admin will be restricted to their own tenant by the controller
router.post('/locations', requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]), createLocation);
router.get('/locations', requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]), getAllLocations);
router.get('/locations/:id', requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]), getLocationById);
router.put('/locations/:id', requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]), updateLocation);
router.delete('/locations/:id', requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]), deleteLocation);

// User-Tenant assignment routes (SuperAdmin AND Admin)
router.post('/users/:userId/tenants', requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]), assignUserToTenants);
router.get('/users/:userId/tenants', requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]), getUserTenants);
router.delete('/users/:userId/tenants/:tenantId', requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]), removeUserFromTenant);

export default router;
