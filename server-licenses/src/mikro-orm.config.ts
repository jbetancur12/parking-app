import { Options } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import dotenv from 'dotenv';
import path from 'path';
import { License } from './entities/License';
import { LicenseLog } from './entities/LicenseLog';

dotenv.config();

const config: Options = {
    driver: PostgreSqlDriver,
    dbName: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    entities: [License, LicenseLog],
    debug: true,
};

export default config;
