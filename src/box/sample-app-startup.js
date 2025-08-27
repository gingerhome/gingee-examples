module.exports = async function() {
    await ginger(function($g) {
        // usually you would do something useful here like 
        // creating or migrating db schema used by the app
        // warming up the app cache

        const crypto = require('crypto');
        $g.log.info("Yay! The startup script is executing. rnd string: " + crypto.generateSecureRandomString(16));
    });
};
