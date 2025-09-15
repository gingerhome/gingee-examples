module.exports = async function() {
    await gingee(async ($g) => {
        const db = require('db');
        const DB_NAME = 'gintin_db';

        try {
            const sql = `
                SELECT 
                    p.id, 
                    p.title, 
                    p.slug,
                    p.cover_image_url,
                    p.published_at, 
                    u.username as author_name
                FROM "Posts" p
                JOIN "Users" u ON p.author_id = u.id
                WHERE p.status = 'published'
                ORDER BY p.published_at DESC;
            `;

            const posts = await db.query.many(DB_NAME, sql);
            $g.response.send(posts);

        } catch (err) {
            $g.log.error('Failed to list public posts.', { error: err.message });
            $g.response.send({ error: 'An internal server error occurred.' }, 500);
        }
    });
};
