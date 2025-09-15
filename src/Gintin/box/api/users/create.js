module.exports = async function() {
    await gingee(async ($g) => {
        const db = require('db');
        const crypto = require('crypto');
        const { validate } = require('utils');
        const DB_NAME = 'gintin_db';

        const { username, password } = $g.request.body;

        if (validate.isEmpty(username) || validate.isEmpty(password)) {
            return $g.response.send({ error: 'Username and password are required.' }, 400);
        }
        if (password.length < 8) {
            return $g.response.send({ error: 'Password must be at least 8 characters long.' }, 400);
        }

        try {
            // Check for duplicate username
            const existingUser = await db.query.one(DB_NAME, 'SELECT id FROM "Users" WHERE username = $1', [username]);
            if (existingUser) {
                return $g.response.send({ error: 'Username already taken.' }, 409); // 409 Conflict
            }

            const hashedPassword = await crypto.hashPassword(password);
            const sql = 'INSERT INTO "Users" (username, password_hash) VALUES ($1, $2) RETURNING id, username, created_at';
            const newUser = await db.query.one(DB_NAME, sql, [username, hashedPassword]);

            $g.response.send(newUser, 201);
        } catch (err) {
            $g.log.error('Failed to create user.', { username, error: err.message });
            $g.response.send({ error: 'An internal server error occurred.' }, 500);
        }
    });
};
