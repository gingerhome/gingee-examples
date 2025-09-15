// File: web/gindoo/box/api/tasks/create.js
module.exports = async function() {
    await gingee(async ($g) => {
        const db = require('db');
        const uuid = require('uuid');
        const utils = require('utils');
        const DB_NAME = 'main_db';

        if (!$g.user) {
            return $g.response.send({ error: 'Unauthorized.' }, 401);
        }

        try {
            const { title, description, status, assignee_id } = $g.request.body;

            if (utils.validate.isEmpty(title) || utils.validate.isEmpty(status)) {
                return $g.response.send({ error: 'Title and status are required fields.' }, 400);
            }

            const newTaskId = uuid.v4();
            const now = new Date().toISOString();

            const sql = `
                INSERT INTO "Tasks" ("id", "title", "description", "status", "assignee_id", "created_at", "updated_at")
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `;
            const params = [newTaskId, title, description || null, status, assignee_id || null, now, now];

            await db.execute(DB_NAME, sql, params);

            // Fetch the newly created task to return it with assignee details
            const newTask = await db.query.one(DB_NAME, `
                SELECT t.*, u.name as "assigneeName", u.avatar_url as "assigneeAvatar"
                FROM "Tasks" t LEFT JOIN "Users" u ON t.assignee_id = u.id
                WHERE t.id = $1`, [newTaskId]);

            $g.response.send(newTask, 201);

        } catch (err) {
            $g.log.error('Failed to create task', { error: err.message, stack: err.stack });
            $g.response.send({ error: 'An internal server error occurred.' }, 500);
        }
    });
};
