module.exports = async function() {
    gingee(function($g) {
        $g.response.send({ message: "Hello world!" });
    });
};
