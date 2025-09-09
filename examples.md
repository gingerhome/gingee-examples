# GingerJS API Usage Examples

This guide contains a list of code examples on using the varied GingerJS API modules. Click [here](https://gingerhome.github.io/gingerjs-docs/) conceptual details on GingerJS . Click [here](https://gingerhome.github.io/gingerjs-docs/docs/server-script.html) for the server script guide in GingerJS.

| Category | Example | Description |
| :-- | :-- | :-- |
| **Simple** | | |
| | [Hello World](#hello-world) | Plain text response |
| | [JSON Response](#json-response) | JSON response |
| | [Binary Response](#binary-response) | Binary response |
| **Payload Handling** | | |
| | [GET with Query](#get-with-query) | Reading query parameters in a GET request |
| | [Dynamic Route](#dynamic-route) | Reading parameters in a dynamic route request |

---

## Hello World
Tests a basic server script that returns a plain text response. This is the simplest possible GingerJS endpoint.

```javascript
module.exports = async function() {
    ginger(async function($g) {
        $g.response.send("Hello, World!");
    });
};
```

## JSON Response
Tests a basic server script that returns a JSON object.

```javascript
module.exports = async function() {
    ginger(function($g) {
        $g.response.send({ message: "Hello world!" });
    });
};
```

## Binary Response
Tests sending a direct binary (image/png) response from a server script.

```javascript
module.exports = async function() {
    ginger(function($g) {
        const fs = require('fs');
        const mimeTypes = require('mime-types');

        const imagePath = "./images/ginger.png";
        const imageData = fs.readFileSync(fs.BOX, imagePath);
        const contentType = mimeTypes.lookup(imagePath) || 'application/octet-stream';
        $g.response.send(imageData, 200, contentType);
    });
};
```

---

## GET with Query
Tests passing query parameters to a GET request. The script will echo back the parsed query object.

```javascript
module.exports = async function() {
    ginger(function($g) {
        var resp = {
            code: 200,
            query: $g.request.query
        };

        $g.response.send(resp, 200, 'application/json');
    });
};
```

## Dynamic Route
Tests manifest-based routing with dynamic URL parameters (/users/:userId).

```javascript
module.exports = async function () {
    await ginger(async ($g) => {
        const userId = $g.request.params.userId;
        $g.response.send({ message: `DYNAMIC ROUTE TEST: Details for user ID: ${userId}` });
    });
};
```

