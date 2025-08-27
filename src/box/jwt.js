module.exports = async function() {
    ginger(async function($g) {
        const {jwt} = require('auth');
        const result = {};

        // --- 1. Create a JWT token ---
        const payload = { userId: 42, role: 'admin' };
        const token = jwt.create(payload);
        result.token = token;

        // --- 2. Verify the JWT token ---
        const verifiedPayload = jwt.verify(token);
        result.verified = verifiedPayload;

        $g.response.send(result);
    });
};
