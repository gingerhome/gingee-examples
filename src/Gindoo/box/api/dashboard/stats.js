// File: web/gindoo/box/api/dashboard/stats.js
module.exports = async function () {
    await gingee(async ($g) => {
        const db = require('db');
        const chart = require('chart');
        const DB_NAME = 'main_db';

        try {
            const { assigneeId } = $g.request.query;

            let sql = `
                SELECT 
                    status, 
                    COUNT(*) as count 
                FROM "Tasks"
            `;
            const params = [];

            if (assigneeId) {
                sql += ' WHERE assignee_id = $1';
                params.push(assigneeId);
            }

            sql += ' GROUP BY status';

            const results = await db.query.many(DB_NAME, sql, params);

            // Process data for the chart
            const labels = ['To Do', 'In Progress', 'Done'];
            const data = [0, 0, 0];
            const statusMap = { 'todo': 0, 'in_progress': 1, 'done': 2 };

            results.forEach(row => {
                if (statusMap[row.status] !== undefined) {
                    data[statusMap[row.status]] = parseInt(row.count, 10);
                }
            });

            // Generate the chart using the Gingee 'chart' module
            const chartConfig = {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Task Status',
                        data: data,
                        backgroundColor: [
                            'rgb(255, 159, 182)', // Pastel Red/Pink
                            'rgb(159, 197, 255)', // Pastel Blue
                            'rgb(168, 255, 159)'  // Pastel Green
                        ],
                        hoverOffset: 4
                    }]
                },
                options: {
                    plugins: {
                        title: {
                            display: true,
                            text: 'Task Distribution'
                        }
                    }
                }
            };

            const chartBuffer = await chart.render(chartConfig, { width: 400, height: 400 });

            // Send the generated chart image directly as the response
            $g.response.send(chartBuffer, 200, 'image/png');

        } catch (err) {
            $g.log.error('Failed to generate dashboard stats', { error: err.message, stack: err.stack });
            $g.response.send({ error: 'An internal server error occurred.' }, 500);
        }
    });
};
