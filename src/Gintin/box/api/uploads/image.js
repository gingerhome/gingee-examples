module.exports = async function() {
    await gingee(async ($g) => {
        const fs = require('fs');
        const image = require('image');
        const uuid = require('uuid');

        try {
            // Gingee automatically parses multipart/form-data and places files here.
            // We assume the frontend sends the file with the field name 'image'.
            const files = $g.request.body.files;
            if (!files || !files.image) {
                return $g.response.send({ error: 'No image file was uploaded. Ensure the file input is named "image".' }, 400);
            }

            const uploadedFile = files.image;
            
            // Generate a unique, random filename to prevent conflicts.
            // We will save all images in the modern .jpeg format.
            const uniqueFilename = `${uuid.v4()}.jpeg`;

            // Define the save path within the app's public web directory.
            const savePath = `/images/uploads/${uniqueFilename}`;

            // Process the image using the built-in 'image' module.
            // 1. Load the image from the uploaded buffer.
            // 2. Resize it to a max-width of 1200px to keep file sizes reasonable.
            //    'withoutEnlargement' ensures we don't scale up smaller images.
            // 3. Convert the image to JPEG format with 80% quality for great compression.
            // 4. Get the final processed image data as a buffer.
            const imageProcessor = await image.loadFromBuffer(uploadedFile.data);
            const processedImageBuffer = await imageProcessor.resize({ width: 1200, withoutEnlargement: true })
                .format('jpeg', { quality: 80 })
                .toBuffer();

            // Use the secure 'fs' module to write the file to the public directory.
            // 'fs.WEB' is a constant that targets the app's public root (web/gintin/).
            // The fs module will automatically create the 'images/uploads' directory if it doesn't exist.
            await fs.writeFile(fs.WEB, savePath, processedImageBuffer);
            
            // Construct the public, web-accessible URL for the new image.
            const publicUrl = `/gintin/${savePath}`;

            // Send a success response with the URL for the frontend to use.
            $g.response.send({
                message: 'Image uploaded successfully!',
                url: publicUrl
            });

        } catch (err) {
            $g.log.error('Image upload failed.', { userId: $g.request.user.userId, error: err.message });
            $g.response.send({ error: 'An internal server error occurred during image upload.' }, 500);
        }
    });
};
