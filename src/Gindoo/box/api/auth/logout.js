// File: web/gindoo/box/api/auth/logout.js
module.exports = async function() {
    await gingee(async ($g) => {
        // Clear the cookie by setting its expiration date to the past
        $g.response.cookies.gindoo_session = `logged_out; HttpOnly; Secure; SameSite=Strict; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        $g.response.send({ message: 'Logout successful.' });
    });
};