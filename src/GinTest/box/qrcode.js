module.exports = async function () {
    gingee(async function ($g) {
        const qrcode = require('qrcode');

        const qrText = 'https://github.com/google/gemini-api';
        const qrcodeText = '123456789012';

        // --- 1. Generate QR Code as a Data URL ---
        const qrCodeDataUrl = await qrcode.qrcode(qrText, {
            output: qrcode.DATA_URL,
            width: 250,
            margin: 2
        });

        // --- 2. Generate qrcode as a Data URL ---
        const qrcodeDataUrl = await qrcode.barcode('EAN13', qrcodeText, {
            output: qrcode.DATA_URL
        });

        // --- 3. Generate a QR Code as a Buffer (to show the other option works) ---
        const qrBuffer = await qrcode.qrcode('Test Buffer Output');


        // --- 4. Send an HTML response to display the images ---
        const htmlResponse = `
            <!DOCTYPE html>
            <html>
            <head><title>qrcode Test</title></head>
            <body style="font-family: sans-serif; text-align: center;">
                <h1>qrcode and QR Code Generation Test</h1>
                
                <h2>QR Code (Generated as Data URL)</h2>
                <p>Encodes: "${qrText}"</p>
                <img src="${qrCodeDataUrl}" alt="QR Code">
                
                <hr style="margin: 2rem 0;">

                <h2>qrcode (EAN-13, Generated as Data URL)</h2>
                <p>Encodes: "${qrcodeText}"</p>
                <img src="${qrcodeDataUrl}" alt="qrcode">
                
                <hr style="margin: 2rem 0;">
                
                <h2>Buffer Test</h2>
                <p>A QR code was also generated as a buffer in the background.</p>
                <p>Buffer length: ${qrBuffer.length} bytes.</p>
            </body>
            </html>
            `;

        $g.response.send(htmlResponse, 200, 'text/html');
    });
};
