module.exports = async function() {
    await gingee(async ($g) => {
        const db = require('db');
        try {
            const sql = `
                SELECT u.name, COUNT(t.id) as completed_count
                FROM "Users" u
                JOIN "Tasks" t ON u.id = t.assignee_id
                WHERE t.status = 'done'
                GROUP BY u.id
                ORDER BY completed_count DESC
                LIMIT 5
            `;
            const results = await db.query.many('main_db', sql);
            $g.response.send(results);
        } catch (err) { /* ... error handling ... */ }
    });
};
