"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const permission_middleware_1 = require("../middleware/permission.middleware");
const User_1 = require("../entities/User");
const router = (0, express_1.Router)();
const controller = new user_controller_1.UserController();
// All routes require authentication
router.use(auth_middleware_1.authenticateToken);
// SUPER_ADMIN and ADMIN routes
router.get('/', (0, permission_middleware_1.requireRole)([User_1.UserRole.SUPER_ADMIN, User_1.UserRole.ADMIN]), controller.getAll);
router.post('/', (0, permission_middleware_1.requireRole)([User_1.UserRole.SUPER_ADMIN, User_1.UserRole.ADMIN]), controller.create);
router.put('/:id', (0, permission_middleware_1.requireRole)([User_1.UserRole.SUPER_ADMIN, User_1.UserRole.ADMIN]), controller.update);
router.delete('/:id', (0, permission_middleware_1.requireRole)([User_1.UserRole.SUPER_ADMIN, User_1.UserRole.ADMIN]), controller.delete);
// Any authenticated user can change their own password
router.post('/change-password', controller.changePassword);
exports.default = router;
