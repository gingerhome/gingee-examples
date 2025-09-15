// File: web/gindoo/box/setup/02_seed_admin.js

module.exports = async function() {
    await gingee(async ($g) => {
        const db = require('db');
        const crypto = require('crypto');
        const uuid = require('uuid');
        const DB_NAME = 'main_db';

        // 1. Safely access the default admin config from app.json's env block
        const defaultAdmin = $g.app.env ? $g.app.env.default_admin : null;

        if (!defaultAdmin || !defaultAdmin.email || !defaultAdmin.password) {
            $g.log.info('[Seed Admin] Default admin credentials are not configured in app.json. Skipping admin creation.');
            return;
        }

        try {
            // 2. Check if a user with the admin email already exists
            const existingAdmin = await db.query.one(DB_NAME, 'SELECT id FROM "Users" WHERE "email" = $1', [defaultAdmin.email]);

            if (existingAdmin) {
                $g.log.info(`[Seed Admin] Admin user '${defaultAdmin.email}' already exists. No action taken.`);
                return; // Do nothing if the admin already exists
            }

            // 3. If the admin does not exist, create them
            $g.log.info(`[Seed Admin] Creating default admin user: ${defaultAdmin.email}`);
            
            const passwordHash = await crypto.hashPassword(defaultAdmin.password);
            const adminId = uuid.v4();
            
            const sql = 'INSERT INTO "Users" (id, name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5)';
            await db.execute(DB_NAME, sql, [adminId, 'Administrator', defaultAdmin.email, passwordHash, 'admin']);
            
            $g.log.info('[Seed Admin] Default admin user created successfully.');

        } catch (err) {
            $g.log.error('[Seed Admin] An error occurred while trying to create the default admin user.', { error: err.message, stack: err.stack });
        }
    });
};