module.exports = async function() {
    ginger(function($g) {
        var resp = {
            code: 200,
            query: $g.request.query
        };

        $g.response.send(resp, 200, 'application/json');
    });
};
