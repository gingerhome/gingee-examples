module.exports = async function() {
    ginger(async function($g) {
        $g.response.send("Hello, World!");
    });
};
