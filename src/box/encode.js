module.exports = function () {
    gingee(function ($g) {
        const encoder = require('encode');

        const originalText = "Hello, world! This is a test.";
        const encodedText = encoder.base64.encode(originalText);
        const decodedText = encoder.base64.decode(encodedText);

        const complexText = "Über-secure data with emojis 🚀 & symbols ©.";
        const encodedComplexText = encoder.base64.encode(complexText);
        const decodedComplexText = encoder.base64.decode(encodedComplexText);

        const dataObject = { userId: 42, role: "admin", permissions: ["read", "write"] };
        const jsonString = JSON.stringify(dataObject);
        const encodedObject = encoder.base64.encode(jsonString);
        const decodedJsonString = encoder.base64.decode(encodedObject);
        const decodedObject = JSON.parse(decodedJsonString);

        const originalUrlParam = "node js & gingee tutorials?";
        const encodedUrlParam = encoder.uri.encode(originalUrlParam);
        const decodedUrlParam = encoder.uri.decode(encodedUrlParam);

        const originalHexText = "This is a secret key 🔑";
        const encodedHexText = encoder.hex.encode(originalHexText);
        const decodedHexText = encoder.hex.decode(encodedHexText);

        const maliciousHtml = "<script>alert('You have been hacked!');</script>";
        const encodedHtml = encoder.html.encode(maliciousHtml);
        const decodedHtml = encoder.html.decode(encodedHtml);

        const responseData = {
            simple_string: {
                original: originalText,
                encoded: encodedText,
                decoded: decodedText,
                matches: originalText === decodedText
            },
            complex_string: {
                original: complexText,
                encoded: encodedComplexText,
                decoded: decodedComplexText,
                matches: complexText === decodedComplexText
            },
            json_object_transport: {
                original_object: dataObject,
                encoded_for_transport: encodedObject,
                decoded_object: decodedObject,
                matches: JSON.stringify(dataObject) === JSON.stringify(decodedObject)
            },
            url_encoding: {
                original: originalUrlParam,
                encoded: encodedUrlParam,
                decoded: decodedUrlParam,
                matches: originalUrlParam === decodedUrlParam,
            },
            hex_encoding: {
                original: originalHexText,
                encoded: encodedHexText,
                decoded: decodedHexText,
                matches: originalHexText === decodedHexText,
            },
            html_entity_encoding: {
                original: maliciousHtml,
                encoded: encodedHtml,
                decoded: decodedHtml,
                matches: maliciousHtml === decodedHtml,
            }
        };

        $g.response.send(responseData);
    });
};
