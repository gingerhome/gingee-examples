module.exports = async function() {
    await gingee(async ($g) => {
        const db = require('db');
        const DB_NAME = 'gintin_db';

        try {
            // Explicitly select columns to avoid sending the password hash
            const sql = 'SELECT id, username, created_at FROM "Users" ORDER BY username ASC';
            const users = await db.query.many(DB_NAME, sql);
            $g.response.send(users);
        } catch (err) {
            $g.log.error('Failed to list users.', { error: err.message });
            $g.response.send({ error: 'An internal server error occurred.' }, 500);
        }
    });
};
