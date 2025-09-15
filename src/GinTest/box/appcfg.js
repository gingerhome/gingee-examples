module.exports = function() {
    gingee(async function($g) {
        $g.response.send($g.app);
    });
};
