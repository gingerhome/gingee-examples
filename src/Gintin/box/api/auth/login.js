module.exports = async function() {
    await gingee(async ($g) => {
        const db = require('db');
        const crypto = require('crypto');
        const auth = require('auth');
        const { validate } = require('utils');

        const { username, password } = $g.request.body;
        const DB_NAME = 'gintin_db';

        if (validate.isEmpty(username) || validate.isEmpty(password)) {
            return $g.response.send({ error: 'Username and password are required.' }, 400);
        }

        try {
            // Find the user in the database
            const user = await db.query.one(DB_NAME, 'SELECT * FROM "Users" WHERE "username" = $1', [username]);

            if (!user) {
                return $g.response.send({ error: 'Invalid credentials.' }, 401);
            }

            // Verify the password against the stored hash
            const isPasswordValid = await crypto.verifyPassword(password, user.password_hash);

            if (!isPasswordValid) {
                return $g.response.send({ error: 'Invalid credentials.' }, 401);
            }

            // Create a JWT for the authenticated user
            const payload = { userId: user.id, username: user.username };
            const token = auth.jwt.create(payload, '8h'); // Token expires in 8 hours

            $g.response.send({
                message: 'Login successful!',
                token: token
            });

        } catch (err) {
            $g.log.error('Login attempt failed.', { username, error: err.message });
            $g.response.send({ error: 'An internal server error occurred.' }, 500);
        }
    });
};
