module.exports = async function() {
    await gingee(async ($g) => {
        const db = require('db');
        const { validate } = require('utils');
        const DB_NAME = 'gintin_db';

        const { postId } = $g.request.params;
        const { author_name, content } = $g.request.body;

        // --- Validation ---
        if (validate.isEmpty(author_name) || validate.isEmpty(content)) {
            return $g.response.send({ error: 'Author name and content are required.' }, 400);
        }
        if (content.length > 2000) { // Simple length check
             return $g.response.send({ error: 'Comment is too long.' }, 400);
        }

        try {
            // Verify the post exists and is published before allowing a comment
            const post = await db.query.one(DB_NAME, 'SELECT id FROM "Posts" WHERE id = $1 AND status = \'published\'', [postId]);
            if (!post) {
                return $g.response.send({ error: 'You cannot comment on this post.' }, 403);
            }

            const sql = `
                INSERT INTO "Comments" (post_id, author_name, content, status)
                VALUES ($1, $2, $3, 'pending');
            `;
            const params = [postId, author_name, content];
            
            await db.execute(DB_NAME, sql, params);

            $g.response.send({ message: 'Comment submitted successfully and is awaiting moderation.' }, 201);

        } catch (err) {
            $g.log.error('Failed to create public comment.', { postId, author_name, error: err.message });
            $g.response.send({ error: 'An internal server error occurred while submitting your comment.' }, 500);
        }
    });
};
