module.exports = async function() {
    await gingee(async ($g) => {
        const db = require('db');
        const DB_NAME = 'gintin_db';
        const { postId } = $g.request.params;

        try {
            const result = await db.execute(DB_NAME, 'DELETE FROM "Posts" WHERE "id" = $1', [postId]);

            if (result.rowCount === 0) {
                return $g.response.send({ error: 'Post not found.' }, 404);
            }

            $g.response.send({ message: 'Post deleted successfully.' });

        } catch (err) {
            $g.log.error('Failed to delete post.', { postId, error: err.message });
            $g.response.send({ error: 'An internal server error occurred.' }, 500);
        }
    });
};
