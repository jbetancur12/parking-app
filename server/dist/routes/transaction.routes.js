"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transaction_controller_1 = require("../controllers/transaction.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateToken);
// Restrict viewing full transaction history/shift data to admins
router.use((0, auth_middleware_1.requireRole)(['ADMIN', 'SUPER_ADMIN']));
router.get('/shift/:shiftId', transaction_controller_1.getByShift);
exports.default = router;
