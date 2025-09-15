// File: web/gindoo/box/api/users/delete.js
module.exports = async function() {
    await gingee(async ($g) => {
        const db = require('db');
        const DB_NAME = 'main_db';

        if (!$g.user || $g.user.role !== 'admin') {
            return $g.response.send({ error: 'Forbidden' }, 403);
        }
        
        try {
            const { userId } = $g.request.params;
            
            // Prevent admin from deleting themselves
            if ($g.user.id === userId) {
                return $g.response.send({ error: 'Administrators cannot delete their own account.' }, 400);
            }
            
            const affectedRows = await db.execute(DB_NAME, 'DELETE FROM "Users" WHERE "id" = $1', [userId]);

            if (affectedRows === 0) {
                return $g.response.send({ error: 'User not found.' }, 404);
            }

            $g.response.send({ message: 'User deleted successfully.' });

        } catch (err) {
            $g.log.error('Failed to delete user', { error: err.message });
            $g.response.send({ error: 'An internal server error occurred.' }, 500);
        }
    });
};