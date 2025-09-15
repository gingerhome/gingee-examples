// File: web/gindoo/box/api/tasks/delete.js

module.exports = async function() {
    await gingee(async ($g) => {
        const db = require('db');
        const DB_NAME = 'main_db';

        // 1. Check for admin role
        if (!$g.user || $g.user.role !== 'admin') {
            return $g.response.send({ error: 'Forbidden. Only administrators can delete tasks.' }, 403);
        }

        try {
            const { taskId } = $g.request.params;
            const sql = 'DELETE FROM "Tasks" WHERE "id" = $1';
            const affectedRows = await db.execute(DB_NAME, sql, [taskId]);

            if (affectedRows === 0) {
                return $g.response.send({ error: 'Task not found.' }, 404);
            }

            $g.response.send({ message: 'Task deleted successfully.' });

        } catch (err) {
            $g.log.error('Failed to delete task', { error: err.message, taskId: $g.request.params.taskId });
            $g.response.send({ error: 'An internal server error occurred.' }, 500);
        }
    });
};