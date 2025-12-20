import { Options } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import dotenv from 'dotenv';

dotenv.config();

const config: Options = {
    driver: PostgreSqlDriver,
    dbName: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    entities: ['./dist/entities'],
    entitiesTs: ['./src/entities'],
    metadataProvider: TsMorphMetadataProvider,
    debug: true,
};

export default config;
