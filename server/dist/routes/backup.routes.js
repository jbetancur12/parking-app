"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const backup_controller_1 = require("../controllers/backup.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const User_1 = require("../entities/User");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateToken);
// Only Admins can download backups
router.get('/export', (0, auth_middleware_1.requireRole)([User_1.UserRole.ADMIN, User_1.UserRole.SUPER_ADMIN]), backup_controller_1.exportData);
exports.default = router;
