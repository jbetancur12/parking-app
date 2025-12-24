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
router.use(requireRole([UserRole.SUPER_ADMIN]));

// Tenant routes
router.post('/tenants', createTenant);
router.get('/tenants', getAllTenants);
router.get('/tenants/:id', getTenantById);
router.put('/tenants/:id', updateTenant);
router.patch('/tenants/:id/status', updateTenantStatus);

// Location routes
router.post('/locations', createLocation);
router.get('/locations', getAllLocations);
router.get('/locations/:id', getLocationById);
router.put('/locations/:id', updateLocation);
router.delete('/locations/:id', deleteLocation);

// User-Tenant assignment routes
router.post('/users/:userId/tenants', assignUserToTenants);
router.get('/users/:userId/tenants', getUserTenants);
router.delete('/users/:userId/tenants/:tenantId', removeUserFromTenant);

export default router;
