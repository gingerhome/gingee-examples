// File: web/gindoo/box/api/auth/me.js
module.exports = async function() {
    await gingee(async ($g) => {
        // This endpoint relies on the auth_middleware to run first.
        // If the middleware succeeds, $g.user will be populated.
        if ($g.user) {
            $g.response.send($g.user);
        } else {
            // This case should theoretically not be reached if the middleware is active
            $g.response.send({ error: 'No active session.' }, 401);
        }
    });
};