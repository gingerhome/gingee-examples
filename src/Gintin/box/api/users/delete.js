module.exports = async function() {
    await gingee(async ($g) => {
        const db = require('db');
        const DB_NAME = 'gintin_db';
        const { userId } = $g.request.params;

        try {
            // SAFETY CHECK: Prevent deletion if the user owns posts.
            const postCountResult = await db.query.one(DB_NAME, 'SELECT COUNT(id) as post_count FROM "Posts" WHERE author_id = $1', [userId]);
            if (postCountResult && postCountResult.post_count > 0) {
                return $g.response.send({ error: 'Cannot delete user. Reassign or delete their posts first.' }, 400);
            }

            const result = await db.execute(DB_NAME, 'DELETE FROM "Users" WHERE id = $1', [userId]);

            if (result.rowCount === 0) {
                return $g.response.send({ error: 'User not found.' }, 404);
            }

            $g.response.send({ message: 'User deleted successfully.' });
        } catch (err) {
            $g.log.error('Failed to delete user.', { userId, error: err.message });
            $g.response.send({ error: 'An internal server error occurred.' }, 500);
        }
    });
};
