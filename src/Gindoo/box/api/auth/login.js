// File: web/gindoo/box/api/auth/login.js
module.exports = async function() {
    await gingee(async ($g) => {
        const db = require('db');
        const crypto = require('crypto');
        const auth = require('auth');
        const DB_NAME = 'main_db';

        try {
            const { email, password } = $g.request.body;
            const user = await db.query.one(DB_NAME, 'SELECT * FROM "Users" WHERE "email" = $1', [email]);

            if (!user) {
                return $g.response.send({ error: 'Invalid credentials.' }, 401);
            }

            const isPasswordCorrect = await crypto.verifyPassword(password, user.password_hash);
            if (!isPasswordCorrect) {
                return $g.response.send({ error: 'Invalid credentials.' }, 401);
            }

            // Create JWT and set it in a secure cookie
            const token = auth.jwt.create({ userId: user.id, email: user.email }, '7d'); // Token expires in 7 days
            $g.response.cookies.gindoo_session = `${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${7 * 24 * 60 * 60}`;

            // Return user object without the password hash
            const { password_hash, ...userResponse } = user;
            $g.response.send(userResponse);

        } catch (err) {
            $g.log.error('Login failed', { error: err.message });
            $g.response.send({ error: 'An internal server error occurred.' }, 500);
        }
    });
};
