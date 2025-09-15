// File: web/gindoo/box/api/users/change-password.js

module.exports = async function() {
    await gingee(async ($g) => {
        const db = require('db');
        const crypto = require('crypto');
        const utils = require('utils');
        const DB_NAME = 'main_db';

        if (!$g.user) {
            return $g.response.send({ error: 'Unauthorized. You must be logged in to change your password.' }, 401);
        }

        const { currentPassword, newPassword } = $g.request.body;

        if (utils.validate.isEmpty(newPassword) || !utils.validate.hasLength(newPassword, { min: 8 })) {
            return $g.response.send({ error: 'New password must be at least 8 characters long.' }, 400);
        }

        try {
            const userRecord = await db.query.one(DB_NAME, 'SELECT password_hash FROM "Users" WHERE "id" = $1', [$g.user.id]);
            if (!userRecord) {
                return $g.response.send({ error: 'User not found.' }, 404);
            }

            const isPasswordCorrect = await crypto.verifyPassword(currentPassword, userRecord.password_hash);
            if (!isPasswordCorrect) {
                return $g.response.send({ error: 'The current password you entered is incorrect.' }, 403);
            }

            const newPasswordHash = await crypto.hashPassword(newPassword);
            await db.execute(DB_NAME, 'UPDATE "Users" SET "password_hash" = $1 WHERE "id" = $2', [newPasswordHash, $g.user.id]);

            $g.response.send({ message: 'Password updated successfully.' });

        } catch (err) {
            $g.log.error('Failed to change password', { userId: $g.user.id, error: err.message });
            $g.response.send({ error: 'An internal server error occurred.' }, 500);
        }
    });
};