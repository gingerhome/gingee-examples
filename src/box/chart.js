module.exports = async function () {
    ginger(async ($g) => {
        const chart = require('chart');

        try {
            // 1. Define a standard Chart.js configuration object.
            const chartConfig = {
                type: 'bar',
                data: {
                    labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
                    datasets: [{
                        label: '# of Votes',
                        data: [12, 19, 3, 5, 2, 3],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.5)',
                            'rgba(54, 162, 235, 0.5)',
                            'rgba(255, 206, 86, 0.5)',
                            'rgba(75, 192, 192, 0.5)',
                            'rgba(153, 102, 255, 0.5)',
                            'rgba(255, 159, 64, 0.5)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'Sample Bar Chart'
                        }
                    }
                }
            };

            // 2. Render the chart to a buffer.
            const imageBuffer = await chart.render(chartConfig, {
                width: 800,
                height: 450,
                output: chart.BUFFER
            });

            // 3. Send the image back as the response.
            $g.response.send(imageBuffer, 200, 'image/png');

        } catch (err) {
            $g.log.error('Error in chart_test script:', { error: err.message, stack: err.stack });
            $g.response.send({ error: 'Internal Server Error', message: err.message }, 500);
        }
    });
};
