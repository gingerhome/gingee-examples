module.exports = async function() {
    gingee(async function($g) {
        $g.response.send("Hello, World!");
    });
};
