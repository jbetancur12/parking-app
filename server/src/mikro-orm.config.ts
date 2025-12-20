import { Options } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { SqliteDriver } from '@mikro-orm/sqlite';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const isSqlite = process.env.DB_TYPE === 'sqlite';

// Determine base path - when running from dist, __dirname will be in dist folder
const isCompiledDist = __filename.includes('dist');
const baseDir = isCompiledDist ? __dirname : path.join(__dirname, '../dist');

const config: Options = {
    driver: isSqlite ? SqliteDriver : PostgreSqlDriver,
    dbName: isSqlite ? path.join(process.cwd(), 'data', 'parking.db') : process.env.DB_NAME,
    user: isSqlite ? undefined : process.env.DB_USER,
    password: isSqlite ? undefined : process.env.DB_PASSWORD,
    host: isSqlite ? undefined : process.env.DB_HOST,
    port: isSqlite ? undefined : Number(process.env.DB_PORT),
    entities: [path.join(baseDir, 'entities/**/*.js')],
    entitiesTs: [path.join(__dirname, 'entities/**/*.ts')],
    debug: true,
    allowGlobalContext: true,
};

export default config;
