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
| | [POST JSON Body](#post-json-body) | Reading body with application/json body content in a POST request |
| | [POST Form Body](#post-form-body) | Reading body with x-www-form-urlencoded body content in a POST request |
| | [POST Multipart Body](#post-multipart-body) | Reading body with multipart/form-data body content in a POST request |
| **Request Context** | | |
| | [Reading Cookies](#reading-cookies) | Reading cookies from a request |
| | [Reading App Meta](#reading-app-meta) | Reading meta info of the app from a request |
| **Using Modules** | | |
| | [App specific modules](#using-app-specfic-modules) | Tests the sandboxed `require()` of a local library |
| | [External modules](#using-external-modules) | Tests the sandboxed execution of various UMD-formatted external libraries |
| **GingerJS Modules** | | |
| | [Cache](#cache) | Performs a full set, get, delete, and clear cycle on the app's namespaced cache. |
| | [Chart](#chart) | Tests the 'chart' module by generating a PNG bar chart on the server. |
| | [Crypto](#crypto) | Runs a comprehensive test of the 'crypto' module, including hashing, HMAC, encryption/decryption, and password functions. |


---

## Hello World
Tests a basic server script that returns a plain text response. This is the simplest possible GingerJS endpoint.

```javascript
module.exports = async function() {
    await ginger(async function($g) {
        $g.response.send("Hello, World!");
    });
};
```

## JSON Response
Tests a basic server script that returns a JSON object.

```javascript
module.exports = async function() {
    await ginger(function($g) {
        $g.response.send({ message: "Hello world!" });
    });
};
```

## Binary Response
Tests sending a direct binary (image/png) response from a server script.

```javascript
module.exports = async function() {
    await ginger(function($g) {
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
    await ginger(function($g) {
        var resp = {
            code: 200,
            query: $g.request.query
        };

        $g.response.send(resp);
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

## POST JSON Body
Tests sending a JSON object in the request body. The script will parse and echo it back.

```javascript
module.exports = async function() {
    await ginger(function($g) {
        var resp = {
            code: 200,
            body: $g.request.body
        };

        $g.response.send(resp);
    });
};
```

## POST Form Body
Tests posting body data as 'application/x-www-form-urlencoded'. The script will parse and echo it back.

```javascript
module.exports = async function() {
    await ginger(function($g) {
        var resp = {
            code: 200,
            body: $g.request.body
        };
        
        $g.response.send(resp);
    });
};
```

## POST Multipart Body
Tests a multipart/form-data request, including a file upload. The script will parse and echo it back.

```javascript
module.exports = async function () {
    await ginger(function ($g) {
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

        $g.response.send(resp);
    });
};
```
---

## Reading Cookies
Tests reading and setting cookies. This test will display the cookies it received from your browser and set new cookies in the response.

```javascript
module.exports = async function() {
    await ginger(function($g) {
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
```

## Reading App Meta
Tests the '$g.app' context object by returning its contents.

```javascript
module.exports = function() {
    await ginger(async function($g) {
        $g.response.send($g.app);
    });
};
```
---

## Using app specfic modules
Tests the sandboxed `require()` of a local library

```javascript
module.exports = async function() {
    await ginger(function($g) {
        const {add} = require('./libs/sample-lib.js');
        $g.response.send("Lib call result: " + add(5, 10));
    });
};
```

## Using external modules
Tests the sandboxed execution of various UMD-formatted external libraries

```javascript
module.exports = function () {
    await ginger(async function ($g) {
        const tinycolor = require('./libs/external/tinycolor.min.js');  //https://github.com/bgrins/TinyColor
        const mathjs = require('./libs/external/math.min.js');  //https://mathjs.org/
        const lodash = require('./libs/external/lodash.min.js');  //https://lodash.com/
        const handlebars = require('./libs/external/handlebars.js');  //https://handlebarsjs.com/
        const voca = require('./libs/external/voca.min.js');  //https://vocajs.pages.dev/
        const markedjs = require('./libs/external/marked.umd.js');  //https://marked.js.org/
        const datefns = require('./libs/external/datefns.min.js');  //https://date-fns.org/ (modified to use UMD build, changed window to module.exports)
        const ramda = require('./libs/external/ramda.min.js');  //https://ramdajs.com/
        const dayjs = require('./libs/external/dayjs.min.js');  //https://day.js.org/*/
        const { faker } = require('./libs/external/fakerjs.min.js');  //https://fakerjs.dev/
        const immutable = require('./libs/external/immutable.min.js');  //https://immutable-js.com/
        const mustache = require('./libs/external/mustache.min.js');  //https://github.com/janl/mustache.js

        const tcTest = {
            color: tinycolor("red").toHexString(),
            isDark: tinycolor("red").isDark(),
            isLight: tinycolor("red").isLight()
        };

        const mathTest = {
            sqrt4: mathjs.sqrt(-4),
        };

        const lodashTest = {
            chunk: lodash.chunk([1, 2, 3, 4, 5], 2),
            compact: lodash.compact([0, 1, false, 2, '', 3])
        };

        const hbs = handlebars.create();
        const template = hbs.compile("Hello, {{name}}!");
        const hbsTest = template({ name: "GingerJS" });

        const vocaTest = {
            camelCase: voca.camelCase("hello world"),
            kebabCase: voca.kebabCase("hello world"),
            snakeCase: voca.snakeCase("hello world")
        };

        const datefnsTest = {
            format: datefns.format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        };

        const markedTest = markedjs.marked("Hello **world**!");

        const xs = [{ a: 1 }, { a: 2 }, { a: 3 }];
        const fIdx = ramda.findIndex(ramda.propEq('a', 2))(xs) + ", " + ramda.findIndex(ramda.propEq('a', 4))(xs);
        const ramdaTest = {
            add: ramda.add(5, 10),
            multiply: ramda.multiply(5, 10),
            findIndex: fIdx
        };

        const dayjsTest = {
            format: dayjs().format('{YYYY} MM-DDTHH:mm:ss SSS [Z] A')
        };

        const fakerTest = {
            userId: faker.string.uuid(),
            username: faker.internet.username(),
            email: faker.internet.email(),
            avatar: faker.image.avatar(),
            password: faker.internet.password(),
            birthdate: faker.date.birthdate(),
            registeredAt: faker.date.past(),
        };

        const immutableTest = {
            list: immutable.List([1, 2, 3]),
            map: immutable.Map({ a: 1, b: 2 }),
            set: immutable.Set([1, 2, 3])
        };

        const mustacheTest = mustache.default.render("Hello, {{name}}!", { name: "GingerJS" });
        
        const responseObject = {
            tinycolor: tcTest,
            mathjs: mathTest,
            lodash: lodashTest,
            handlebars: hbsTest,
            voca: vocaTest,
            datefns: datefnsTest,
            markedjs: markedTest,
            ramda: ramdaTest,
            dayjs: dayjsTest,
            faker: fakerTest,
            immutable: immutableTest,
            mustache: mustacheTest
        };

        $g.response.send(responseObject);
    });
};
```

## Cache
Performs a full set, get, delete, and clear cycle on the app's namespaced cache.

```javascript
module.exports = async function() {
    ginger(async ($g) => {
        const cache = require('cache');

        const results = [];
        //1. Test cache set operation
        await cache.set('secret_key', { message: 'This is from GingerJS tests app' });
        results.push('1. PASS: Cache set operation successful for key "secret_key"');

        //2. Test cache get operation
        const value = await cache.get('secret_key');
        if (value) {
            results.push(`2. PASS: Cache get operation successful for key "secret_key", value: ${JSON.stringify(value)}`);
        } else {
            results.push('2. FAIL: Cache get operation failed for key "secret_key", message: Key not found');
        }

        //3. Test cache del operation
        await cache.del('secret_key');
        results.push({ status: 'ok', key_del: 'secret_key' });

        //3.5 Test cache get after delete
        const deletedValue = await cache.get('secret_key');
        if (deletedValue) {
            results.push(`3.5. FAIL: Cache get operation should have failed for key "secret_key" after deletion, but succeeded with value: ${JSON.stringify(deletedValue)}`);
        } else {
            results.push('3.5. PASS: Cache get operation failed for key "secret_key" after deletion, as expected');
        }

        //4. Test cache clear operation
        await cache.clear();
        results.push('4. PASS: Cache clear operation successful');

        //4.5 Test cache get after clear
        const clearedValue = await cache.get('secret_key');
        if (clearedValue) {
            results.push(`4.5. FAIL: Cache get operation should have failed for key "secret_key" after clear, but succeeded with value: ${JSON.stringify(clearedValue)}`);
        } else {
            results.push('4.5. PASS: Cache get operation failed for key "secret_key" after clear, as expected');
        }

        $g.response.send(results.join('\n'));
    });
};
```

## Chart
Tests the 'chart' module by generating a PNG bar chart on the server

```javascript
module.exports = async function () {
    ginger(async ($g) => {
        const chart = require('chart');

        try {
            // 1. Define a standard Chart.js configuration object.
            const chartConfig = {
                type: 'bar',
                data: {
                    labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
                    datasets: [{
                        label: '# of Votes',
                        data: [12, 19, 3, 5, 2, 3],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.5)',
                            'rgba(54, 162, 235, 0.5)',
                            'rgba(255, 206, 86, 0.5)',
                            'rgba(75, 192, 192, 0.5)',
                            'rgba(153, 102, 255, 0.5)',
                            'rgba(255, 159, 64, 0.5)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'Sample Bar Chart'
                        }
                    }
                }
            };

            // 2. Render the chart to a buffer.
            const imageBuffer = await chart.render(chartConfig, {
                width: 800,
                height: 450,
                output: chart.BUFFER
            });

            // 3. Send the image back as the response.
            $g.response.send(imageBuffer, 200, 'image/png');

        } catch (err) {
            $g.log.error('Error in chart_test script:', { error: err.message, stack: err.stack });
            $g.response.send({ error: 'Internal Server Error', message: err.message }, 500);
        }
    });
};
```

## Crypto
Runs a comprehensive test of the 'crypto' module, including hashing, HMAC, encryption/decryption, and password functions.

```javascript
module.exports = async function () {
    ginger(async function ($g) {
        const crypto = require('crypto');

        const input = "hello world";
        const secret = "my-super-secret-key";
        const userPassword = "Password123!";

        const crc32Result = crypto.CRC32(input);
        const md5Result = crypto.MD5(input);
        const sha2Result = crypto.SHA2(input);
        const sha3Result = crypto.SHA3(input);

        const hmacSignature = crypto.hmacSha256Encrypt(input, secret);
        const isSignatureValid = crypto.hmacSha256Verify(hmacSignature, input, secret);
        const isSignatureInvalid = crypto.hmacSha256Verify(hmacSignature, "hello world!", secret); // Different input

        const secretMessage = "This is a secret message for user 42.";
        const encryptedData = crypto.encrypt(secretMessage, secret);
        const decryptedMessage = crypto.decrypt(encryptedData, secret);
        const failedDecryption = crypto.decrypt(encryptedData, "wrong-secret");

        const passwordHash = await crypto.hashPassword(userPassword);
        const isPasswordCorrect = await crypto.verifyPassword(userPassword, passwordHash);
        const isPasswordIncorrect = await crypto.verifyPassword("wrong_password", passwordHash);

        const apiKey = crypto.generateSecureRandomString(32);
        const sessionId = crypto.generateSecureRandomString(24);
        const withoutNumbers = crypto.generateSecureRandomString(24, true);

        const responseData = {
            inputString: input,
            hashes: {
                crc32: crc32Result,
                md5: md5Result,
                sha256: sha2Result,
                sha3_256: sha3Result,
            },
            hmac: {
                secretKey: "hidden-for-security",
                signature: hmacSignature,
                verification: {
                    "check_with_correct_data": isSignatureValid, // Should be true
                    "check_with_incorrect_data": isSignatureInvalid, // Should be false
                }
            },
            encryption: {
                original_message: secretMessage,
                encrypted_package: encryptedData,
                decrypted_message: decryptedMessage,
                failed_decryption_result: failedDecryption // Should be null
            },
            random_strings: {
                generated_api_key: apiKey,
                generated_session_id: sessionId,
                without_numbers: withoutNumbers
            },
            password: {
                original: userPassword,
                hash: passwordHash,
                verification: {
                    correct_password_check: isPasswordCorrect, // Should be true
                    incorrect_password_check: isPasswordIncorrect // Should be false
                }
            }
        };

        $g.response.send(responseData);
    });
};
```
