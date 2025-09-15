// File: web/gindoo/box/api/users/list.js
module.exports = async function() {
    await gingee(async ($g) => {
        const db = require('db');
        const DB_NAME = 'main_db';

        try {
            const sql = 'SELECT * FROM "Users" ORDER BY "name" ASC';
            const users = await db.query.many(DB_NAME, sql);
            $g.response.send(users);
        } catch (err) {
            $g.log.error('Failed to fetch users', { error: err.message, stack: err.stack });
            $g.response.send({ error: 'An internal server error occurred.' }, 500);
        }
    });
};