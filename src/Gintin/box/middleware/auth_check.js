module.exports = async function() {
    await gingee(async ($g) => {
        // Public routes are exempt from the auth check
        if ($g.request.path.includes('/api/public/')) {
            return; // Continue to the next script
        }
        
        // The login route itself is also exempt
        if ($g.request.path.includes('/api/auth/login')) {
            return; // Continue to the next script
        }

        const auth = require('auth');
        const authHeader = $g.request.headers['authorization'];
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return $g.response.send({ error: 'Unauthorized: Missing or invalid token.' }, 401);
        }

        const token = authHeader.split(' ')[1];
        const payload = auth.jwt.verify(token);

        if (!payload) {
            return $g.response.send({ error: 'Unauthorized: Invalid or expired token.' }, 401);
        }

        // IMPORTANT: Attach the user payload to the request for use in other scripts
        $g.request.user = payload;
    });
};
