module.exports = async function() {
    await gingee(async ($g) => {
        const db = require('db');
        const DB_NAME = 'gintin_db';
        const { postId } = $g.request.params;

        try {
            const post = await db.query.one(DB_NAME, 'SELECT * FROM "Posts" WHERE "id" = $1', [postId]);

            if (!post) {
                return $g.response.send({ error: 'Post not found.' }, 404);
            }

            $g.response.send(post);

        } catch (err) {
            $g.log.error('Failed to get single post.', { postId, error: err.message });
            $g.response.send({ error: 'An internal server error occurred.' }, 500);
        }
    });
};
