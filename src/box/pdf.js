module.exports = async function () {
    gingee(async ($g) => {
        const pdf = require('pdf');
        const chart = require('chart'); // We'll generate a chart to embed in the PDF

        try {
            // --- 1. Generate a chart image buffer to embed ---
            const chartConfig = {
                type: 'pie',
                data: {
                    labels: ['Organic', 'Direct', 'Referral'],
                    datasets: [{ data: [550, 250, 200], backgroundColor: ['#3a86ff', '#ffbe0b', '#fb5607'] }]
                }
            };
            const chartBuffer = await chart.render(chartConfig, { width: 300, height: 300 });
            // Convert buffer to a base64 data URL for pdfmake
            const chartImage = `data:image/png;base64,${chartBuffer.toString('base64')}`;

            // --- 2. Define the PDF Document ---
            const docDefinition = {
                pageSize: 'LETTER',
                pageMargins: [40, 60, 40, 60],
                header: { text: 'Gingee Weekly Report', alignment: 'center', margin: [0, 20, 0, 0] },
                footer: function (currentPage, pageCount) { return { text: `Page ${currentPage} of ${pageCount}`, alignment: 'center' }; },

                content: [
                    { text: 'Dashboard Overview', style: 'header' },
                    'This report shows a summary of key metrics for the past week.',

                    // This table creates our grid layout
                    {
                        style: 'tableExample',
                        table: {
                            widths: ['*', 'auto'], // '*' means take remaining space, 'auto' fits content
                            body: [
                                // First Row
                                [
                                    {
                                        stack: [ // 'stack' lets you put multiple items in a cell
                                            { text: 'User Engagement', style: 'subheader' },
                                            'User engagement has seen a 15% increase week-over-week. This is a very long line of text to demonstrate how the content will automatically wrap and cause the row height to expand. All other cells in this row will automatically adjust their height to match, ensuring the layout remains aligned.'
                                        ]
                                    },
                                    {
                                        image: chartImage,
                                        width: 250 // Control image size inside the cell
                                    }
                                ],
                                // Second Row
                                [
                                    {
                                        text: 'This is a simple text cell in the second row. Its height is determined by the content.'
                                    },
                                    {
                                        text: 'This cell is aligned with the one on the left.'
                                    }
                                ]
                            ]
                        },
                        layout: 'lightHorizontalLines' // Optional: add some styling to the table
                    }
                ],

                styles: {
                    header: { fontSize: 22, bold: true, margin: [0, 0, 0, 10] },
                    subheader: { fontSize: 16, bold: true, margin: [0, 10, 0, 5] },
                    tableExample: { margin: [0, 5, 0, 15] },
                }
            };

            // --- 3. Generate the PDF buffer ---
            const pdfBuffer = await pdf.create(docDefinition);

            // --- 4. Send the PDF back to the browser ---
            const fileName = `report-${Date.now()}.pdf`;
            $g.response.headers['Content-Disposition'] = `attachment; filename="${fileName}"`;
            $g.response.send(pdfBuffer, 200, 'application/pdf');

        } catch (err) {
            $g.log.error('Error in pdf_test script:', { error: err.message, stack: err.stack });
            $g.response.send({ error: 'Internal Server Error', message: err.message }, 500);
        }
    });
};
