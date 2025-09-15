module.exports = async function() {
    await gingee(async ($g) => {
        const db = require('db');
        const chart = require('chart');
        try {
            const sql = `
                SELECT u.name, COUNT(t.id) as task_count
                FROM "Users" u
                LEFT JOIN "Tasks" t ON u.id = t.assignee_id
                GROUP BY u.id
                ORDER BY u.name
            `;
            const results = await db.query.many('main_db', sql);

            const chartConfig = {
                type: 'bar',
                data: {
                    labels: results.map(r => r.name),
                    datasets: [{
                        label: 'Total Assigned Tasks',
                        data: results.map(r => r.task_count),
                        backgroundColor: 'rgba(159, 197, 255, 0.7)',
                        borderColor: 'rgb(159, 197, 255)',
                        borderWidth: 1
                    }]
                },
                options: { scales: { y: { beginAtZero: true } } }
            };
            const chartBuffer = await chart.render(chartConfig, { width: 600, height: 400 });
            $g.response.send(chartBuffer, 200, 'image/png');
        } catch (err) { /* ... error handling ... */ }
    });
};
