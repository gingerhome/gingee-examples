// File: web/gindoo/box/api/auth/register.js
module.exports = async function() {
    await gingee(async ($g) => {
        const db = require('db');
        const uuid = require('uuid');
        const utils = require('utils');
        const crypto = require('crypto');
        const DB_NAME = 'main_db';

        try {
            const { name, email, password } = $g.request.body;

            if (utils.validate.isEmpty(password) || !utils.validate.hasLength(password, { min: 8 })) {
                return $g.response.send({ error: 'Password is required and must be at least 8 characters long.' }, 400);
            }

            const passwordHash = await crypto.hashPassword(password);
            const newUserId = uuid.v4();

            const sql = 'INSERT INTO "Users" ("id", "name", "email", "password_hash") VALUES ($1, $2, $3, $4)';
            await db.execute(DB_NAME, sql, [newUserId, name, email, passwordHash]);

            const newUser = await db.query.one(DB_NAME, 'SELECT id, name, email, avatar_url FROM "Users" WHERE "id" = $1', [newUserId]);
            $g.response.send(newUser, 201);

        } catch (err) {
            // ... (existing error handling for unique email)
        }
    });
};
