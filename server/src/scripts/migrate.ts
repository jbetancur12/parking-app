import { MikroORM, RequestContext } from '@mikro-orm/core';
import config from '../mikro-orm.config';
import { MonthlyClient } from '../entities/MonthlyClient';
import { logger } from '../utils/logger';
import fs from 'fs';
import readline from 'readline';

async function migrate() {
    console.log('Initializing ORM...');
    const orm = await MikroORM.init(config);
    const em = orm.em.fork();

    console.log('ORM Initialized. Starting migration...');

    const sqlFilePath = 'c:\\Users\\alejo\\Documents\\carpetaprotegida\\parkingsof.sql';

    if (!fs.existsSync(sqlFilePath)) {
        logger.error({ sqlFilePath }, 'SQL file not found:');
        process.exit(1);
    }

    const fileStream = fs.createReadStream(sqlFilePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let inMensualidad = false;
    let count = 0;
    let errors = 0;

    // Helper to parse SQL values line
    // Example: (123, 'TEXT', NULL, '2023-01-01'),
    const parseLine = (line: string) => {
        // Remove leading ( and trailing ), or );
        const clean = line.trim().replace(/^\(/, '').replace(/\)[;,]?$/, '');

        const values: string[] = [];
        let current = '';
        let inQuote = false;

        for (let i = 0; i < clean.length; i++) {
            const char = clean[i];

            if (char === "'" && clean[i - 1] !== '\\') {
                inQuote = !inQuote;
            } else if (char === ',' && !inQuote) {
                values.push(current.trim());
                current = '';
                continue;
            }
            current += char;
        }
        values.push(current.trim());

        // Clean up quotes and NULLs
        return values.map(v => {
            if (v === 'NULL') return null;
            if (v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1);
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
            if (!line.trim().startsWith('(')) continue;

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

                if (cols.length < 14) continue;

                const plate = cols[1]?.replace(/\s+/g, '').toUpperCase();
                const name = cols[4] || 'Sin Nombre';
                const rate = Number(cols[2]) || 0;
                const endDateRaw = cols[6];
                const startDateRaw = cols[11] || cols[3]; // inicio or fecha_registro
                const phone = cols[7] || cols[5] || '';
                const vehicleTypeRaw = cols[9]?.toLowerCase() || '';
                const status = cols[13]?.toLowerCase();

                if (!plate) continue;

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
                if (vehicleTypeRaw.includes('carro')) vehicleType = 'Carro';
                if (vehicleTypeRaw.includes('bicicleta')) vehicleType = 'Bicicleta';

                // Check duplicate
                const exists = await em.findOne(MonthlyClient, { plate });
                if (exists) {
                    console.log(`Skipping duplicate plate: ${plate}`);
                    continue;
                }

                const client = em.create(MonthlyClient, {
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
                } as any);

                em.persist(client);
                count++;

                if (count % 50 === 0) console.log(`Processed ${count} records...`);

            } catch (err) {
                logger.error({ err }, 'Error parsing line: ${line}');
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
