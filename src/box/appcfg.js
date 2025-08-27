module.exports = function() {
    ginger(async function($g) {
        $g.response.send($g.app);
    });
};
