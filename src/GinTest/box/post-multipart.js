module.exports = async function () {
    gingee(function ($g) {
        if ($g.request.body && $g.request.body.files) {
            var fileFields = Object.keys($g.request.body.files);
            fileFields.forEach(fileField => {
                delete $g.request.body.files[fileField].data; // Remove file data to avoid sending large data in response
            });
        }

        var resp = {
            code: 200,
            body: $g.request.body
        };

        $g.response.send(resp, 200, 'application/json');
    });
};
