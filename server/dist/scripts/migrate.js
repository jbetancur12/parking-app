"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@mikro-orm/core");
const mikro_orm_config_1 = __importDefault(require("../mikro-orm.config"));
const MonthlyClient_1 = require("../entities/MonthlyClient");
const fs_1 = __importDefault(require("fs"));
const readline_1 = __importDefault(require("readline"));
async function migrate() {
    console.log('Initializing ORM...');
    const orm = await core_1.MikroORM.init(mikro_orm_config_1.default);
    const em = orm.em.fork();
    console.log('ORM Initialized. Starting migration...');
    const sqlFilePath = 'c:\\Users\\alejo\\Documents\\carpetaprotegida\\parkingsof.sql';
    if (!fs_1.default.existsSync(sqlFilePath)) {
        console.error('SQL file not found:', sqlFilePath);
        process.exit(1);
    }
    const fileStream = fs_1.default.createReadStream(sqlFilePath);
    const rl = readline_1.default.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    let inMensualidad = false;
    let count = 0;
    let errors = 0;
    // Helper to parse SQL values line
    // Example: (123, 'TEXT', NULL, '2023-01-01'),
    const parseLine = (line) => {
        // Remove leading ( and trailing ), or );
        const clean = line.trim().replace(/^\(/, '').replace(/\)[;,]?$/, '');
        const values = [];
        let current = '';
        let inQuote = false;
        for (let i = 0; i < clean.length; i++) {
            const char = clean[i];
            if (char === "'" && clean[i - 1] !== '\\') {
                inQuote = !inQuote;
            }
            else if (char === ',' && !inQuote) {
                values.push(current.trim());
                current = '';
                continue;
            }
            current += char;
        }
        values.push(current.trim());
        // Clean up quotes and NULLs
        return values.map(v => {
            if (v === 'NULL')
                return null;
            if (v.startsWith("'") && v.endsWith("'"))
                return v.slice(1, -1);
            return v;
        });
    };
    for await (const line of rl) {
        if (line.includes('INSERT INTO `mensualidad`')) {
            inMensualidad = true;
            continue;
        }
        if (line.includes('INSERT INTO') && !line.includes('`mensualidad`')) {
            inMensualidad = false;
        }
        if (inMensualidad) {
            if (!line.trim().startsWith('('))
                continue;
            try {
                const cols = parseLine(line);
                // Indices map based on: id, placa, valor, fecha, cliente, tel, vence, cel, lugar, tipo, obs, inicio, user, estado
                // 0: id
                // 1: placa
                // 2: valor (rate)
                // 3: fecha_registro
                // 4: cliente (name)
                // 5: tel
                // 6: vence (end)
                // 7: cel
                // 8: lugar
                // 9: tipo
                // 11: inicio (start)
                // 13: estado
                if (cols.length < 14)
                    continue;
                const plate = cols[1]?.replace(/\s+/g, '').toUpperCase();
                const name = cols[4] || 'Sin Nombre';
                const rate = Number(cols[2]) || 0;
                const endDateRaw = cols[6];
                const startDateRaw = cols[11] || cols[3]; // inicio or fecha_registro
                const phone = cols[7] || cols[5] || '';
                const vehicleTypeRaw = cols[9]?.toLowerCase() || '';
                const status = cols[13]?.toLowerCase();
                if (!plate)
                    continue;
                // Determine dates
                const endDate = endDateRaw ? new Date(endDateRaw) : new Date();
                const startDate = startDateRaw ? new Date(startDateRaw) : new Date();
                // Determine active
                // Legacy 'activo' or 'caduco'
                const isActive = status === 'activo';
                // Determine vehicle type
                // "mensualidad moto" -> Moto
                // "mensualidad carro" -> Carro
                let vehicleType = 'Moto'; // Default
                if (vehicleTypeRaw.includes('carro'))
                    vehicleType = 'Carro';
                if (vehicleTypeRaw.includes('bicicleta'))
                    vehicleType = 'Bicicleta';
                // Check duplicate
                const exists = await em.findOne(MonthlyClient_1.MonthlyClient, { plate });
                if (exists) {
                    console.log(`Skipping duplicate plate: ${plate}`);
                    continue;
                }
                const client = em.create(MonthlyClient_1.MonthlyClient, {
                    plate,
                    name,
                    phone,
                    monthlyRate: rate,
                    startDate,
                    endDate,
                    isActive,
                    vehicleType,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                em.persist(client);
                count++;
                if (count % 50 === 0)
                    console.log(`Processed ${count} records...`);
            }
            catch (err) {
                console.error(`Error parsing line: ${line}`, err);
                errors++;
            }
        }
    }
    console.log(`Flushing changes...`);
    await em.flush();
    console.log(`Migration complete. Imported: ${count}, Errors: ${errors}`);
    await orm.close();
}
migrate().catch(err => {
    console.error(err);
    process.exit(1);
});
