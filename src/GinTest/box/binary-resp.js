module.exports = async function() {
    gingee(function($g) {
        const fs = require('fs');
        const mimeTypes = require('mime-types');

        const imagePath = "./images/gingee.png";
        const imageData = fs.readFileSync(fs.BOX, imagePath);
        const contentType = mimeTypes.lookup(imagePath) || 'application/octet-stream';
        $g.response.send(imageData, 200, contentType);
    });
};
