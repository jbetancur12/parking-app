"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const shift_controller_1 = require("../controllers/shift.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateToken); // Protect all shift routes
router.post('/open', shift_controller_1.openShift);
router.post('/close', shift_controller_1.closeShift);
router.get('/current', shift_controller_1.getActiveShift);
router.get('/closed', shift_controller_1.getAllClosed);
exports.default = router;
