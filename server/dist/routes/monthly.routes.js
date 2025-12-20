"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const monthly_controller_1 = require("../controllers/monthly.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const controller = new monthly_controller_1.MonthlyClientController();
router.use(auth_middleware_1.authenticateToken); // Protect all routes
router.get('/', controller.getAll);
router.post('/', controller.create);
router.post('/:id/renew', controller.renew);
router.get('/:id/history', controller.getHistory);
router.patch('/:id/status', controller.toggleStatus);
exports.default = router;
