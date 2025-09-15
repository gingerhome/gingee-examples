module.exports = async function() {
    gingee(function($g) {
        const {add} = require('./libs/sample-lib.js');
        $g.response.send("Lib call result: " + add(5, 10));
    });
};
