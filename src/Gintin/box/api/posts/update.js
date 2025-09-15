module.exports = async function() {
    await gingee(async ($g) => {
        const db = require('db');
        const { validate, string } = require('utils');
        const DB_NAME = 'gintin_db';

        const { postId } = $g.request.params;
        const { title, content, status, cover_image_url } = $g.request.body;

        if (validate.isEmpty(title)) {
            return $g.response.send({ error: 'Title is required.' }, 400);
        }

        try {
            // First, retrieve the current post to check its status
            const currentPost = await db.query.one(DB_NAME, 'SELECT status FROM "Posts" WHERE id = $1', [postId]);
            if (!currentPost) {
                return $g.response.send({ error: 'Post not found.' }, 404);
            }

            const updatedAt = new Date().toISOString();
            // Only set the published_at date if the post is moving to 'published' for the first time
            const publishedAt = (currentPost.status !== 'published' && status === 'published')
                ? updatedAt
                : undefined; // Let the query builder ignore this if it's undefined

            const newSlug = string.slugify(title);

            const sql = `
                UPDATE "Posts"
                SET
                    title = $1,
                    content = $2,
                    status = $3,
                    cover_image_url = $4,
                    updated_at = $5,
                    published_at = COALESCE($6, published_at),
                    slug = $7
                WHERE id = $8
                RETURNING *;
            `;
            const params = [title, content, status, cover_image_url, updatedAt, publishedAt, newSlug, postId];

            const updatedPost = await db.query.one(DB_NAME, sql, params);

            $g.response.send(updatedPost);

        } catch (err) {
            $g.log.error('Failed to update post.', { postId, error: err.message });
            $g.response.send({ error: 'An internal server error occurred.' }, 500);
        }
    });
};
