module.exports = async function () {
    ginger(async function ($g) {
        const fs = require('fs');
        const image = require('image');

        const sourceImagePath = './images/ginger.png';
        const outputWebPath = 'generated/processed_image.webp';

        // --- 1. Load the source image using our module's load function ---
        // 'load' will use fs.readFileSync(fs.BOX, ...) under the hood.
        const processor = image.loadFromFile(fs.BOX, sourceImagePath);

        // --- 2. Perform a chain of manipulations ---
        await processor
            .resize({ width: 200, height: 200, fit: 'contain', background: '#FFFFFF' })
            .greyscale()
            .blur(1)
            .format('webp', { quality: 80 })
            // 3. Save the final image to the public WEB scope.
            .toFile(fs.WEB, outputWebPath);

        // --- 4. Verify the file was created and respond ---
        if (!fs.existsSync(fs.WEB, outputWebPath)) {
            throw new Error("Image processing failed to create the output file.");
        }

        const responseHtml = `
            <h1>Image Processing Test Successful</h1>
            <p>The original image at <b>./assets/ginger.png</b> was processed.</p>
            <p>A 200x200, greyscale, blurred WebP version was saved to the public folder.</p>
            <h2>Result:</h2>
            <img src="${$g.request.protocol}://${$g.request.hostname}/tests/${outputWebPath}?t=${Date.now()}" alt="Processed Image">
            <p><a href="${$g.request.protocol}://${$g.request.hostname}/tests/${outputWebPath}" target="_blank">View Image Directly</a></p>
        `;

        $g.response.send(responseHtml, 200, 'text/html');
    });
};
