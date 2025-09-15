module.exports = async function() {
    await gingee(async ($g) => {
        const db = require('db');
        const DB_NAME = 'gintin_db';
        const { slug } = $g.request.params;

        try {
            const sql = `
                SELECT
                    p.id,
                    p.title,
                    p.slug,
                    p.content,
                    p.cover_image_url,
                    p.published_at,
                    u.username as author_name
                FROM "Posts" p
                JOIN "Users" u ON p.author_id = u.id
                WHERE p.slug = $1 AND p.status = 'published';
            `;
            const post = await db.query.one(DB_NAME, sql, [slug]);

            if (!post) {
                return $g.response.send({ error: 'Post not found.' }, 404);
            }

            $g.response.send(post);

        } catch (err)
        {
            $g.log.error('Failed to get public post by slug.', { slug, error: err.message });
            $g.response.send({ error: 'An internal server error occurred.' }, 500);
        }
    });
};
