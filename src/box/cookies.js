module.exports = async function() {
    ginger(function($g) {
        var fs = require('fs');
        
        var htmlContent = fs.readFileSync(fs.BOX, 'assets/testcookies.html');
        htmlContent = htmlContent? htmlContent.toString() : '';
        htmlContent = htmlContent.replace('{{SERVER_COOKIE}}', JSON.stringify($g.request.cookies) || '');
        

        $g.response.cookies = {
            "jscookie": "I am a cookie; Max-Age=300",
            "jscookie2": "i am a http only cookie; Max-Age=300; HttpOnly",
        };

        $g.response.headers["Cache-Control"] = "max-age=0";
        $g.response.headers["Cache-Control"] = "no-store";
        $g.response.send(htmlContent, 200, 'text/html');
    });
};
