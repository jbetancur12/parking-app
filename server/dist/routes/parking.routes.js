"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const parking_controller_1 = require("../controllers/parking.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Public route (must be before authenticateToken for global use, OR handled selectively)
// Since we used router.use(authenticateToken) globally below, we need to arrange carefully.
// Express routers execute middleware in order.
// Public Routes
router.get('/public/status/:id', parking_controller_1.publicStatus);
// Protected Routes
router.use(auth_middleware_1.authenticateToken);
router.post('/entry', parking_controller_1.entryVehicle);
router.get('/preview/:plate', parking_controller_1.previewExit);
router.post('/exit', parking_controller_1.exitVehicle);
router.get('/active', parking_controller_1.getActiveSessions);
exports.default = router;
