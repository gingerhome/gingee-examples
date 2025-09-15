// File: web/gindoo/box/api/tasks/update.js

module.exports = async function() {
    await gingee(async ($g) => {
        const db = require('db');
        const DB_NAME = 'main_db';

        // 1. Check for authenticated user
        if (!$g.user) {
            return $g.response.send({ error: 'Unauthorized.' }, 401);
        }

        try {
            const { taskId } = $g.request.params;
            const updates = $g.request.body;

            // 2. Fetch the current task from the DB to check its assignee
            const currentTask = await db.query.one(DB_NAME, 'SELECT assignee_id FROM "Tasks" WHERE "id" = $1', [taskId]);
            if (!currentTask) {
                return $g.response.send({ error: 'Task not found.' }, 404);
            }

            // 3. CORRECTED Authorization Logic
            const isAdmin = $g.user.role === 'admin';
            const isAssignee = currentTask.assignee_id === $g.user.id;

            // Allow the update only if the user is an admin OR the assignee.
            if (!isAdmin && !isAssignee) {
                return $g.response.send({ error: 'Forbidden. You do not have permission to edit this task.' }, 403);
            }
            
            // 4. Dynamically build the update query
            const fieldsToUpdate = [];
            const params = [];
            let paramIndex = 1;

            for (const key in updates) {
                if (Object.prototype.hasOwnProperty.call(updates, key)) {
                    const dbKey = key === 'assigneeId' ? 'assignee_id' : key;
                    fieldsToUpdate.push(`"${dbKey}" = $${paramIndex++}`);
                    params.push(updates[key]);
                }
            }
            
            if (fieldsToUpdate.length === 0) {
                return $g.response.send({ message: 'No fields to update.' }, 200);
            }

            fieldsToUpdate.push(`"updated_at" = $${paramIndex++}`);
            params.push(new Date().toISOString());
            params.push(taskId);

            const sql = `UPDATE "Tasks" SET ${fieldsToUpdate.join(', ')} WHERE "id" = $${paramIndex}`;
            const affectedRows = await db.execute(DB_NAME, sql, params);

            if (affectedRows === 0) {
                return $g.response.send({ error: 'Task not found or no changes made.' }, 404);
            }
            
            // 5. Fetch and return the fully updated task with user details
            const updatedTask = await db.query.one(DB_NAME, `
                SELECT t.id, t.title, t.description, t.status, t.created_at,
                       u.id as "assigneeId", u.name as "assigneeName", u.avatar_url as "assigneeAvatar"
                FROM "Tasks" t LEFT JOIN "Users" u ON t.assignee_id = u.id
                WHERE t.id = $1`, [taskId]);

            $g.response.send(updatedTask);

        } catch (err) {
            $g.log.error('Failed to update task', { error: err.message, taskId: $g.request.params.taskId });
            $g.response.send({ error: 'An internal server error occurred.' }, 500);
        }
    });
};
