import { MikroORM } from '@mikro-orm/core';
import config from '../mikro-orm.config';
import { User } from '../entities/User';
import bcrypt from 'bcryptjs';

async function testLogin() {
    const orm = await MikroORM.init(config);
    const em = orm.em.fork();

    try {
        const username = 'superadmin';
        const password = 'admin123';

        const user = await em.findOne(User, { username });

        if (!user) {
            console.log(`❌ User "${username}" not found`);
            return;
        }

        console.log(`✅ User found: ${user.username} (${user.role})`);
        console.log(`Stored hash: ${user.password.substring(0, 20)}...`);

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (isValidPassword) {
            console.log(`✅ Password "${password}" is CORRECT!`);
        } else {
            console.log(`❌ Password "${password}" is WRONG!`);

            // Try hashing the password to see what we get
            const newHash = await bcrypt.hash(password, 10);
            console.log(`\nNew hash would be: ${newHash.substring(0, 20)}...`);

            // Test if they match
            const testMatch = await bcrypt.compare(password, newHash);
            console.log(`Test compare against new hash: ${testMatch ? 'PASS' : 'FAIL'}`);
        }
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await orm.close();
    }
}

testLogin();
