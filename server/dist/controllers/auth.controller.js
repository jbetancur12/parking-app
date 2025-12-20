"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupAdmin = exports.setupStatus = exports.login = void 0;
const core_1 = require("@mikro-orm/core");
const User_1 = require("../entities/User");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SECRET_KEY = process.env.JWT_SECRET || 'supersecret_parking_app_key';
const login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    const em = core_1.RequestContext.getEntityManager();
    if (!em) {
        return res.status(500).json({ message: 'Entity Manager not found' });
    }
    const user = await em.findOne(User_1.User, { username });
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
    if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '12h' });
    return res.json({
        token,
        user: {
            id: user.id,
            username: user.username,
            role: user.role,
        },
    });
};
exports.login = login;
const setupStatus = async (req, res) => {
    const em = core_1.RequestContext.getEntityManager();
    const count = await em?.count(User_1.User);
    return res.json({ isConfigured: count && count > 0 });
};
exports.setupStatus = setupStatus;
const setupAdmin = async (req, res) => {
    const em = core_1.RequestContext.getEntityManager();
    const count = await em?.count(User_1.User);
    if (count && count > 0) {
        return res.status(403).json({ message: 'System is already configured' });
    }
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    const admin = em?.create(User_1.User, {
        username,
        password: hashedPassword,
        role: User_1.UserRole.SUPER_ADMIN,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    });
    if (admin) {
        await em?.persistAndFlush(admin);
        return res.json({ message: 'Super Admin created successfully' });
    }
    else {
        return res.status(500).json({ message: 'Error creating admin' });
    }
};
exports.setupAdmin = setupAdmin;
