module.exports = async function () {
    ginger(async function ($g) {
        //The tests app is not allowed to access the 'platform' module.
        //This should throw an error.
        const results = [];
        try {
            const platform = require("platform");
            results.push("FAIL: Access to platform module should be denied but was allowed.");
        } catch (error) {
            results.push("PASS: Access to platform module denied: " + error.message);
        }
        $g.response.send(results.join("\n"));
    });
};
