"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const router = (0, express_1.Router)();
router.post('/login', auth_controller_1.login);
router.get('/setup-status', auth_controller_1.setupStatus);
router.post('/setup-admin', auth_controller_1.setupAdmin);
exports.default = router;
