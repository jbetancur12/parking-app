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
const expense_routes_1 = __importDefault(require("./routes/expense.routes"));
const wash_routes_1 = __importDefault(require("./routes/wash.routes"));
const brand_routes_1 = __importDefault(require("./routes/brand.routes"));
const sale_routes_1 = __importDefault(require("./routes/sale.routes"));
const tariff_routes_1 = __importDefault(require("./routes/tariff.routes"));
const setting_routes_1 = __importDefault(require("./routes/setting.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const transaction_routes_1 = __importDefault(require("./routes/transaction.routes"));
const stats_routes_1 = __importDefault(require("./routes/stats.routes"));
const backup_routes_1 = __importDefault(require("./routes/backup.routes"));
const audit_routes_1 = __importDefault(require("./routes/audit.routes"));
const agreement_routes_1 = __importDefault(require("./routes/agreement.routes"));
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
        // REMOVED: Custom seeding logic moved to First Run Setup flow
        // const em = orm.em.fork();
        // const count = await em.count(User);
        // ...
        // Fork the entity manager for each request
        app.use((req, res, next) => {
            core_1.RequestContext.create(orm.em, next);
        });
        app.use('/api/auth', auth_routes_1.default);
        app.use('/api/shifts', shift_routes_1.default);
        app.use('/api/parking', parking_routes_1.default);
        app.use('/api/monthly', monthly_routes_1.default);
        app.use('/api/reports', report_routes_1.default);
        app.use('/api/expenses', expense_routes_1.default);
        app.use('/api/wash', wash_routes_1.default);
        app.use('/api/brands', brand_routes_1.default);
        app.use('/api/sales', sale_routes_1.default);
        app.use('/api/tariffs', tariff_routes_1.default);
        app.use('/api/settings', setting_routes_1.default);
        app.use('/api/users', user_routes_1.default);
        app.use('/api/transactions', transaction_routes_1.default);
        app.use('/api/stats', stats_routes_1.default);
        app.use('/api/backup', backup_routes_1.default);
        app.use('/api/audit', audit_routes_1.default);
        app.use('/api/agreements', agreement_routes_1.default);
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
