module.exports = async function() {
    await gingee(async ($g) => {
        const db = require('db');
        const crypto = require('crypto');
        const DB_NAME = 'gintin_db';

        // Get default admin credentials from app.json's env block
        const defaultUser = $g.app.env.DEFAULT_ADMIN_USER || 'admin';
        const defaultPass = $g.app.env.DEFAULT_ADMIN_PASSWORD || 'password';

        try {
            $g.log.info('Gintin Startup: Checking for existing users...');
            const userCount = await db.query.one(DB_NAME, 'SELECT COUNT(id) as count FROM "Users"');

            if (userCount && userCount.count === 0) {
                $g.log.warn('Gintin Startup: No users found. Creating default admin user...');
                const hashedPassword = await crypto.hashPassword(defaultPass);

                const sql = 'INSERT INTO "Users" (username, password_hash) VALUES ($1, $2)';
                await db.execute(DB_NAME, sql, [defaultUser, hashedPassword]);
                
                $g.log.info(`Gintin Startup: Default admin user "${defaultUser}" created successfully.`);
                $g.log.warn('SECURITY WARNING: Please change the default password immediately after first login.');
            } else {
                $g.log.info('Gintin Startup: At least one user already exists. Skipping admin creation.');
            }
        } catch (err) {
            $g.log.error('Gintin Startup: Failed to create default admin user.', { error: err.message });
            throw err;
        }
    });
};
