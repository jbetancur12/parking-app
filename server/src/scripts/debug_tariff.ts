import { MikroORM } from '@mikro-orm/core';
import config from '../mikro-orm.config';
import { Tariff } from '../entities/Tariff';

const debug = async () => {
    try {
        console.log('Initializing ORM...');
        const orm = await MikroORM.init(config);
        console.log('ORM Initialized');

        const em = orm.em.fork();
        console.log('Fetching Tariffs...');
        const tariffs = await em.find(Tariff, {});
        console.log('Tariffs found:', tariffs.length);
        console.log(JSON.stringify(tariffs, null, 2));

        await orm.close();
    } catch (error) {
        console.error('Error debugging tariffs:', error);
    }
};

debug();
