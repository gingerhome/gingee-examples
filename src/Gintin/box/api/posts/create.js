module.exports = async function() {
    await gingee(async ($g) => {
        const db = require('db');
        const uuid = require('uuid');
        const { validate, string } = require('utils');
        const DB_NAME = 'gintin_db';

        const { title, content, status, cover_image_url } = $g.request.body;
        const authorId = $g.request.user.userId;

        // --- Validation ---
        if (validate.isEmpty(title)) {
            return $g.response.send({ error: 'Title is required.' }, 400);
        }
        const validStatuses = ['draft', 'published'];
        if (status && !validStatuses.includes(status)) {
            return $g.response.send({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, 400);
        }

        try {
            // --- Prepare Data ---
            const postId = uuid.v4();
            let slug = string.slugify(title);

            // Check for duplicate slugs and append a short unique string if necessary
            const existingSlug = await db.query.one(DB_NAME, 'SELECT id FROM "Posts" WHERE "slug" = $1', [slug]);
            if (existingSlug) {
                slug = `${slug}-${uuid.v4().substring(0, 6)}`;
            }

            const finalStatus = status || 'draft';
            const publishedAt = (finalStatus === 'published') ? new Date().toISOString() : null;

            const sql = `
                INSERT INTO "Posts" (id, title, slug, content, author_id, status, published_at, cover_image_url)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *;
            `;
            const params = [postId, title, slug, content, authorId, finalStatus, publishedAt, cover_image_url];
            
            const newPost = await db.query.one(DB_NAME, sql, params);

            $g.response.send(newPost, 201);

        } catch (err) {
            $g.log.error('Failed to create post.', { title, authorId, error: err.message });
            $g.response.send({ error: 'An internal server error occurred while creating the post.' }, 500);
        }
    });
};
