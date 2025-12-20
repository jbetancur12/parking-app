"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const postgresql_1 = require("@mikro-orm/postgresql");
const reflection_1 = require("@mikro-orm/reflection");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const config = {
    driver: postgresql_1.PostgreSqlDriver,
    dbName: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    entities: ['./dist/entities'],
    entitiesTs: ['./src/entities'],
    metadataProvider: reflection_1.TsMorphMetadataProvider,
    debug: true,
};
exports.default = config;
