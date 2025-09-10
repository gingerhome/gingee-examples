module.exports = async function() {
    await gingee(async ($g) => {
        // We will NOT require the 'path' module here.
        const fs = require('fs');

        try {
            const testId = $g.request.query.id;
            if (!testId) {
                return $g.response.send({ error: 'A test `id` query parameter is required.' }, 400);
            }

            // Step 1: Securely load the manifest to validate the request.
            const manifestJson = fs.readFileSync(fs.BOX, '../tests.json', 'utf8');
            const manifest = JSON.parse(manifestJson);

            // Step 2: Find the configuration for the requested test.
            const testConfig = manifest.find(t => t.id === testId);
            if (!testConfig) {
                return $g.response.send({ error: `Test with id '${testId}' not found.` }, 404);
            }

            // Step 3: Securely derive the script path using only string manipulation.
            // This is the corrected, sandbox-safe logic.
            // Example: "/tests/simple" -> ["", "tests", "simple"] -> "simple"
            const endpointParts = testConfig.endpoint.split('/');
            const scriptFileName = endpointParts.pop() + '.js';
            
            // Step 4: Use the sandboxed fs to read the file.
            const scriptContent = fs.readFileSync(fs.BOX, `../${scriptFileName}`, 'utf8');

            // Step 5: Send the raw source code as a plain text response.
            $g.response.send(scriptContent, 200, 'text/plain');

        } catch (err) {
            $g.log.error('Failed to read test source file', { error: err.message, testId: $g.request.query.id });
            $g.response.send({ error: 'Could not load test source file.' }, 500);
        }
    });
};
