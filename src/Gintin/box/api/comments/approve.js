module.exports = async function() {
    await gingee(async ($g) => {
        const db = require('db');
        const DB_NAME = 'gintin_db';
        const { commentId } = $g.request.params;

        try {
            const sql = `
                UPDATE "Comments"
                SET status = 'approved'
                WHERE id = $1 AND status = 'pending';
            `;
            
            const result = await db.execute(DB_NAME, sql, [commentId]);

            if (result.rowCount === 0) {
                return $g.response.send({ error: 'Comment not found or already approved.' }, 404);
            }

            $g.response.send({ message: 'Comment approved successfully.' });

        } catch (err) {
            $g.log.error('Failed to approve comment.', { commentId, error: err.message });
            $g.response.send({ error: 'An internal server error occurred.' }, 500);
        }
    });
};
