"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const core_1 = require("@mikro-orm/core");
const mikro_orm_config_1 = __importDefault(require("./mikro-orm.config"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const shift_routes_1 = __importDefault(require("./routes/shift.routes"));
const parking_routes_1 = __importDefault(require("./routes/parking.routes"));
const monthly_routes_1 = __importDefault(require("./routes/monthly.routes"));
const report_routes_1 = __importDefault(require("./routes/report.routes"));
const User_1 = require("./entities/User");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const startServer = async () => {
    try {
        const orm = await core_1.MikroORM.init(mikro_orm_config_1.default);
        await orm.getSchemaGenerator().updateSchema();
        console.log('✅ Database connected successfully and schema updated');
        // Seed Admin User
        const em = orm.em.fork();
        const count = await em.count(User_1.User);
        if (count === 0) {
            console.log('🌱 Seeding admin user...');
            const hashedPassword = await bcryptjs_1.default.hash('123456', 10);
            const admin = em.create(User_1.User, {
                username: 'admin',
                password: hashedPassword,
                role: User_1.UserRole.ADMIN,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            await em.persistAndFlush(admin);
            console.log('✅ Admin user created: admin / 123456');
        }
        // Fork the entity manager for each request
        app.use((req, res, next) => {
            core_1.RequestContext.create(orm.em, next);
        });
        app.use('/api/auth', auth_routes_1.default);
        app.use('/api/shifts', shift_routes_1.default);
        app.use('/api/parking', parking_routes_1.default);
        app.use('/api/monthly', monthly_routes_1.default);
        app.use('/api/reports', report_routes_1.default);
        app.get('/', (req, res) => {
            res.send('Parking App API is running');
        });
        app.listen(port, () => {
            console.log(`🚀 Server running on http://localhost:${port}`);
        });
    }
    catch (error) {
        console.error('❌ Error starting server:', error);
        process.exit(1);
    }
};
startServer();
