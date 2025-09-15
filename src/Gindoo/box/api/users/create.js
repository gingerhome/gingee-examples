// File: web/gindoo/box/api/users/create.js
module.exports = async function() {
    await gingee(async ($g) => {
        const db = require('db');
        const crypto = require('crypto');
        const uuid = require('uuid');
        const utils = require('utils');
        const DB_NAME = 'main_db';

        if (!$g.user) {
            return $g.response.send({ error: 'Unauthorized.' }, 401);
        }

        try {
            const { name, email, avatar_url, password = 'password@123'} = $g.request.body;

            if (utils.validate.isEmpty(name) || utils.validate.isEmpty(email)) {
                return $g.response.send({ error: 'Name and email are required.' }, 400);
            }
            if (!utils.validate.isEmail(email)) {
                return $g.response.send({ error: 'A valid email address is required.' }, 400);
            }

            const passwordHash = password ? await crypto.hashPassword(password) : null;

            const newUserId = uuid.v4();
            const sql = 'INSERT INTO "Users" ("id", "name", "email", "avatar_url", "password_hash") VALUES ($1, $2, $3, $4, $5)';
            const params = [newUserId, name, email, avatar_url || null, passwordHash];

            await db.execute(DB_NAME, sql, params);

            const newUser = await db.query.one(DB_NAME, 'SELECT * FROM "Users" WHERE "id" = $1', [newUserId]);
            $g.response.send(newUser, 201);

        } catch (err) {
            // Handle unique constraint violation for email
            if (err.message && err.message.includes('UNIQUE constraint failed')) {
                return $g.response.send({ error: 'A user with this email address already exists.' }, 409);
            }
            $g.log.error('Failed to create user', { error: err.message, stack: err.stack });
            $g.response.send({ error: 'An internal server error occurred.' }, 500);
        }
    });
};
