module.exports = async function() {
    gingee(function($g) {
        var resp = {
            code: 200,
            body: $g.request.body
        };
        
        $g.response.send(resp, 200, 'application/json');
    });
};
