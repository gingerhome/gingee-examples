module.exports = async function() {
    await gingee(async ($g) => {
        const db = require('db');
        const DB_NAME = 'gintin_db';

        try {
            const sql = `
                SELECT 
                    c.id, 
                    c.author_name, 
                    c.content,
                    c.created_at,
                    p.title as post_title
                FROM "Comments" c
                JOIN "Posts" p ON c.post_id = p.id
                WHERE c.status = 'pending'
                ORDER BY c.created_at ASC;
            `;

            const pendingComments = await db.query.many(DB_NAME, sql);
            $g.response.send(pendingComments);

        } catch (err) {
            $g.log.error('Failed to list pending comments.', { error: err.message });
            $g.response.send({ error: 'An internal server error occurred.' }, 500);
        }
    });
};
