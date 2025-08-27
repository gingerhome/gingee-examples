module.exports = async function() {
    ginger(function($g) {
        $g.response.send({ message: "Hello world!" });
    });
};
