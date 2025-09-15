// File: web/gindoo/box/auth_middleware.js
module.exports = async function() {
    await gingee(async ($g) => {
        const auth = require('auth');
        const db = require('db');
        const DB_NAME = 'main_db';

        $g.user = null;

        const token = $g.request.cookies.gindoo_session;
        if (token) {
            const payload = auth.jwt.verify(token);
            if (payload && payload.userId) {
                // If the token is valid, fetch the user's full details from the database
                const user = await db.query.one(
                    DB_NAME, 
                    'SELECT id, name, email, avatar_url, role FROM "Users" WHERE "id" = $1', 
                    [payload.userId]
                );
                
                // If the user exists in the DB, attach them to the request context
                if (user) {
                    $g.user = user;
                }
            }
        }
    });
};
