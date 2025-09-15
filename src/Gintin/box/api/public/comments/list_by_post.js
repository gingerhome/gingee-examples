module.exports = async function() {
    await gingee(async ($g) => {
        const db = require('db');
        const DB_NAME = 'gintin_db';
        const { postId } = $g.request.params;

        try {
            const sql = `
                SELECT id, author_name, content, created_at
                FROM "Comments"
                WHERE post_id = $1 AND status = 'approved'
                ORDER BY created_at ASC;
            `;
            
            const comments = await db.query.many(DB_NAME, sql, [postId]);
            $g.response.send(comments);

        } catch (err) {
            $g.log.error('Failed to list public comments for post.', { postId, error: err.message });
            $g.response.send({ error: 'An internal server error occurred.' }, 500);
        }
    });
};
