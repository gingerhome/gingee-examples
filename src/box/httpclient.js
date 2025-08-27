module.exports = async function () {
    ginger(async function ($g) {
        const httpclient = require('httpclient');
        const formdata = require('formdata');
        const fs = require('fs');

        const results = {};

        // --- 1. GET Request Test ---
        // httpbun.com/get echoes back information about the GET request.
        const getResponse = await httpclient.get('https://httpbun.com/get?test=123');
        results.get_test = JSON.parse(getResponse.body);

        // --- 2. POST JSON Test ---
        const jsonData = { name: "test", value: 42, isCool: true };
        const postJsonResponse = await httpclient.post('https://httpbun.com/post', jsonData, {
            postType: httpclient.JSON // Specify the post type
        });
        results.post_json_test = JSON.parse(postJsonResponse.body);

        // --- 3. POST Form URL Encoded Test ---
        const formURLEncodedBody = { user: "sam", key: "abc-123" };
        const postFormResponse = await httpclient.post('https://httpbun.com/post', formURLEncodedBody, {
            postType: httpclient.FORM
        });
        results.post_form_test = JSON.parse(postFormResponse.body);

        // --- 4. POST Plain Text Test ---
        const textData = "This is a plain text body.";
        const postTextResponse = await httpclient.post('https://httpbun.com/post', textData, {
            postType: httpclient.TEXT
        });
        results.post_text_test = JSON.parse(postTextResponse.body);

        // --- 5. GET Binary Data Test ---
        const imageResponse = await httpclient.get('https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Ghostscript_Tiger.svg/500px-Ghostscript_Tiger.svg.png');
        results.get_image_test = {
            status: imageResponse.status,
            isBuffer: Buffer.isBuffer(imageResponse.body), // Should be true
            contentType: imageResponse.headers['content-type'], // Should be 'image/png'
            size: imageResponse.body.length,
        };

        // --- 6. POST Multipart Form Data Test ---
        const form = formdata.create();
        form.append('name', 'GingerJS App Server');
        form.append('description', 'This is the GingerJS mascot.');
        form.append('image', fs.readFileSync(fs.BOX, './images/ginger.png'), 'ginger.png');

        const postFormDataResponse = await httpclient.post('https://httpbun.com/post', form, {
            postType: httpclient.MULTIPART,
            headers: form.getHeaders()
        });
        const responseJSON = JSON.parse(postFormDataResponse.body);
        delete responseJSON.files.image.content; // Remove the actual file content for brevity
        results.post_multipart_test = responseJSON;

        $g.response.send(results);
    });
};
