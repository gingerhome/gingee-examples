module.exports = async function () {
    gingee(async ($g) => {
        const dashboard = require('dashboard');

        try {
            // 1. Define the dashboard layout.
            const dashboardLayout = {
                width: 1200,
                height: 800,
                backgroundColor: '#F5F5F5',
                grid: { rows: 2, cols: 2, padding: 20 },
                cells: {
                    "bar-chart": { "row": 0, "col": 0, "colspan": 2 },
                    "pie-chart": { "row": 1, "col": 0 },
                    "line-chart": { "row": 1, "col": 1 }
                }
            };

            // 2. Define configurations for each chart.
            const barChartConfig = {
                type: 'bar',
                data: {
                    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
                    datasets: [{ label: 'Sales', data: [50, 75, 60, 85], backgroundColor: '#3a86ff' }]
                },
                options: { plugins: { title: { display: true, text: 'Quarterly Sales' } } }
            };

            const pieChartConfig = {
                type: 'pie',
                data: {
                    labels: ['Desktop', 'Mobile', 'Tablet'],
                    datasets: [{ label: 'Traffic Source', data: [55, 35, 10], backgroundColor: ['#ffbe0b', '#fb5607', '#ff006e'] }]
                },
                options: { plugins: { title: { display: true, text: 'Traffic Source' } } }
            };

            const lineChartConfig = {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
                    datasets: [{ label: 'New Users', data: [12, 19, 13, 15, 22], borderColor: '#8338ec', tension: 0.1 }]
                },
                options: { plugins: { title: { display: true, text: 'User Growth' } } }
            };

            // 3. Initialize the dashboard and make the render calls sequentially.
            const myDashboard = dashboard.init(dashboardLayout);
            await myDashboard.renderChart('bar-chart', barChartConfig);
            await myDashboard.renderChart('pie-chart', pieChartConfig);
            await myDashboard.renderChart('line-chart', lineChartConfig);

            const finalImageBuffer = myDashboard.toBuffer();

            // 4. Send the final composite image as the response.
            $g.response.send(finalImageBuffer, 200, 'image/png');

        } catch (err) {
            $g.log.error('Error in dashboard_test script:', { error: err.message, stack: err.stack });
            $g.response.send({ error: 'Internal Server Error', message: err.message }, 500);
        }
    });
};
