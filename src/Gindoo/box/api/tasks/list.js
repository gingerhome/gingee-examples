// File: web/gindoo/box/api/tasks/list.js

module.exports = async function() {
    await gingee(async ($g) => {
        const db = require('db');
        const DB_NAME = 'main_db';

        if (!$g.user) {
            return $g.response.send({ error: 'Unauthorized.' }, 401);
        }

        try {
            const { assigneeId } = $g.request.query;

            let sql = `
                SELECT 
                    t.id, t.title, t.description, t.status, t.created_at,
                    u.id as "assigneeId", u.name as "assigneeName", u.avatar_url as "assigneeAvatar"
                FROM "Tasks" t
                LEFT JOIN "Users" u ON t.assignee_id = u.id
            `;
            const params = [];

            if (assigneeId) {
                sql += ' WHERE t.assignee_id = $1';
                params.push(assigneeId);
            }

            sql += ' ORDER BY t.created_at DESC';

            const tasks = await db.query.many(DB_NAME, sql, params);

            $g.response.send(tasks);

        } catch (err) {
            $g.log.error('Failed to fetch tasks', { error: err.message, stack: err.stack });
            $g.response.send({ error: 'An internal server error occurred while fetching tasks.' }, 500);
        }
    });
};
