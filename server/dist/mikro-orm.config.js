"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const postgresql_1 = require("@mikro-orm/postgresql");
const sqlite_1 = require("@mikro-orm/sqlite");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const isSqlite = process.env.DB_TYPE === 'sqlite';
// Determine base path - when running from dist, __dirname will be in dist folder
const isCompiledDist = __filename.includes('dist');
const baseDir = isCompiledDist ? __dirname : path_1.default.join(__dirname, '../dist');
const config = {
    driver: isSqlite ? sqlite_1.SqliteDriver : postgresql_1.PostgreSqlDriver,
    dbName: isSqlite ? path_1.default.join(process.cwd(), 'data', 'parking.db') : process.env.DB_NAME,
    user: isSqlite ? undefined : process.env.DB_USER,
    password: isSqlite ? undefined : process.env.DB_PASSWORD,
    host: isSqlite ? undefined : process.env.DB_HOST,
    port: isSqlite ? undefined : Number(process.env.DB_PORT),
    entities: [path_1.default.join(baseDir, 'entities/**/*.js')],
    entitiesTs: [path_1.default.join(__dirname, 'entities/**/*.ts')],
    debug: true,
    allowGlobalContext: true,
};
exports.default = config;
