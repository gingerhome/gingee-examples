module.exports = async function() {
    await ginger(async ($g) => {
        const fs = require('fs');

        try {
            // Read the manifest file from the app's private box.
            const manifestJson = fs.readFileSync(fs.BOX, '../tests.json', 'utf8');
            const tests = JSON.parse(manifestJson);
            
            // Send the parsed JSON array as the response.
            $g.response.send(tests);

        } catch (err) {
            $g.log.error('Failed to read tests.json manifest', { error: err.message });
            $g.response.send({ error: 'Could not load test manifest.' }, 500);
        }
    });
};