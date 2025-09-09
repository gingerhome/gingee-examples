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
| | [Dashboard](#dashboard) | Tests the 'dashboard' module by composing three different charts into a single PNG image. |
| | [DB - PostgreSQL](#db-postgresql) | Performs a full CRUD and transaction rollback test against a PostgreSQL database. |
| | [DB - SQLite](#db---sqlite) | Performs a full CRUD and transaction rollback test against a SQLite database file. |
| | [Encode](#encode) | Tests all encoding and decoding functions (Base64, URI, Hex, HTML). |
| | [File IO](#file-io) | Performs a full async and sync lifecycle test (Write, Read, Copy, Move, Delete) on a single file. |
| | [Folder IO](#folder-io) | Performs a full async and sync lifecycle test (MkDir, Copy, Move, RmDir) on a directory structure. |


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

## Dashboard
Tests the 'dashboard' module by composing three different charts into a single PNG image.

```javascript
module.exports = async function () {
    ginger(async ($g) => {
        const dashboard = require('dashboard');

        try {
            // 1. Define the dashboard layout.
            const dashboardLayout = {
                width: 1200,
                height: 800,
                backgroundColor: '#F5F5F5',
                grid: { rows: 2, cols: 2, padding: 20 },
                cells: {
                    "bar-chart": { "row": 0, "col": 0, "colspan": 2 },
                    "pie-chart": { "row": 1, "col": 0 },
                    "line-chart": { "row": 1, "col": 1 }
                }
            };

            // 2. Define configurations for each chart.
            const barChartConfig = {
                type: 'bar',
                data: {
                    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
                    datasets: [{ label: 'Sales', data: [50, 75, 60, 85], backgroundColor: '#3a86ff' }]
                },
                options: { plugins: { title: { display: true, text: 'Quarterly Sales' } } }
            };

            const pieChartConfig = {
                type: 'pie',
                data: {
                    labels: ['Desktop', 'Mobile', 'Tablet'],
                    datasets: [{ label: 'Traffic Source', data: [55, 35, 10], backgroundColor: ['#ffbe0b', '#fb5607', '#ff006e'] }]
                },
                options: { plugins: { title: { display: true, text: 'Traffic Source' } } }
            };

            const lineChartConfig = {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
                    datasets: [{ label: 'New Users', data: [12, 19, 13, 15, 22], borderColor: '#8338ec', tension: 0.1 }]
                },
                options: { plugins: { title: { display: true, text: 'User Growth' } } }
            };

            // 3. Initialize the dashboard and make the render calls sequentially.
            const myDashboard = dashboard.init(dashboardLayout);
            await myDashboard.renderChart('bar-chart', barChartConfig);
            await myDashboard.renderChart('pie-chart', pieChartConfig);
            await myDashboard.renderChart('line-chart', lineChartConfig);

            const finalImageBuffer = myDashboard.toBuffer();

            // 4. Send the final composite image as the response.
            $g.response.send(finalImageBuffer, 200, 'image/png');

        } catch (err) {
            $g.log.error('Error in dashboard_test script:', { error: err.message, stack: err.stack });
            $g.response.send({ error: 'Internal Server Error', message: err.message }, 500);
        }
    });
};
```

## DB - PostgreSQL
Performs a full CRUD and transaction rollback test against a PostgreSQL database.

```javascript
module.exports = async function () {
    ginger(async function ($g) {
        const db = require('db');
        const uuid = require('uuid');

        const DB_NAME = 'testpostgresdb'; //as configured in app.json
        const results = {};

        // --- 1. SETUP: Drop old table and create the new, complex one ---
        await db.execute(DB_NAME, 'DROP TABLE IF EXISTS public."Test"');
        await db.execute(DB_NAME, `
            CREATE TABLE public."Test" (
                idstr uuid PRIMARY KEY,
                name character varying(100),
                type character varying(50),
                uuid uuid,
                ip inet,
                json json,
                sinta smallint[],
                inta integer[],
                binta bigint[],
                floata real[],
                doublea double precision[],
                numa numeric[],
                datea date[],
                tsarray timestamp without time zone[],
                tzarray timestamp with time zone[],
                uuida uuid[],
                ineta inet[],
                boola boolean[],
                jsona json[],
                bool boolean,
                sint smallint,
                "int" integer,
                bint bigint,
                "float" real,
                double double precision,
                "numeric" numeric,
                string character varying,
                text text,
                ts timestamp without time zone,
                tstz timestamp with time zone,
                date date,
                stringa character varying[],
                texta text[],
                bytea bytea,
                byteaa bytea[]
            )
        `);
        results.setup = "Table 'Test' with complex schema created successfully.";

        // --- 2. PREPARE DATA for all fields ---
        const recordId = uuid.v4();
        const now = new Date();
        const originalRecord = {
            idstr: recordId,
            name: 'Test Record',
            type: 'test',
            uuid: uuid.v4(),
            ip: '192.168.1.1',
            json: { key: 'value', nested: { num: 123 } },
            sinta: [1, 2, 3],
            inta: [100, 200, 300],
            binta: ['9007199254740991', '9007199254740992'], // Use strings for bigints
            floata: [1.1, 2.2, 3.3],
            doublea: [10.10, 20.20],
            numa: [123.45, 678.90],
            datea: ['2023-01-01', '2023-01-02'],
            tsarray: [now, new Date(now.getTime() + 10000)],
            tzarray: [now, new Date(now.getTime() + 20000)],
            uuida: [uuid.v4(), uuid.v4()],
            ineta: ['127.0.0.1', '10.0.0.1'],
            boola: [true, false, true],
            jsona: [{ a: 1 }, { b: 2 }],
            bool: true,
            sint: 12,
            int: 12345,
            bint: '9007199254740993',
            float: 4.56,
            double: 7.89123,
            numeric: 987.65,
            string: 'Hello Varying',
            text: 'This is a long text field.',
            ts: now,
            tstz: now,
            date: '2024-01-15',
            stringa: ['one', 'two'],
            texta: ['alpha', 'beta'],
            bytea: Buffer.from('hello binary'),
            byteaa: [Buffer.from('bin1'), Buffer.from('bin2')]
        };

        // --- 3. CREATE (INSERT) ---
        const insertSql = `INSERT INTO public."Test" (${Object.keys(originalRecord).map(k => `"${k}"`).join(', ')}) 
                       VALUES (${Object.keys(originalRecord).map((_, i) => `$${i + 1}`).join(', ')})`;
        const insertParams = Object.values(originalRecord);
        const insertCount = await db.execute(DB_NAME, insertSql, insertParams);
        results.create = `INSERT operation complete. Rows affected: ${insertCount}`;
        if (insertCount !== 1) throw new Error("INSERT failed.");

        // --- 4. READ and VERIFY ---
        const retrievedRecord = await db.query.one(DB_NAME, 'SELECT * FROM public."Test" WHERE idstr = $1', [recordId]);
        if (!retrievedRecord) throw new Error("READ failed. Record not found.");
        results.read = "Successfully read the record back from the database.";

        // Verification checks (a few examples)
        if (retrievedRecord.string !== 'Hello Varying') throw new Error("String type mismatch.");
        if (retrievedRecord.json.nested.num !== 123) throw new Error("JSON type mismatch.");
        if (retrievedRecord.inta[1] !== 200) throw new Error("Integer array type mismatch.");
        if (retrievedRecord.tstz.getTime() !== now.getTime()) throw new Error("Timestamp with timezone mismatch.");
        if (!retrievedRecord.bytea.equals(Buffer.from('hello binary'))) throw new Error("Bytea type mismatch.");
        results.verify = "Data verification successful. Types were preserved correctly.";

        // --- 5. UPDATE ---
        const updateSql = 'UPDATE public."Test" SET text = $1, inta = array_append(inta, $2) WHERE idstr = $3';
        const updateCount = await db.execute(DB_NAME, updateSql, ['This text has been updated.', 400, recordId]);
        results.update = `UPDATE operation complete. Rows affected: ${updateCount}`;

        const updatedRecord = await db.query.one(DB_NAME, 'SELECT text, inta FROM public."Test" WHERE idstr = $1', [recordId]);
        if (updatedRecord.text !== 'This text has been updated.' || updatedRecord.inta.length !== 4) {
            throw new Error("UPDATE verification failed.");
        }
        results.read_after_update = { description: "Verified updated data.", data: updatedRecord };

        // --- 6. DELETE ---
        const deleteCount = await db.execute(DB_NAME, 'DELETE FROM public."Test" WHERE idstr = $1', [recordId]);
        results.delete = `DELETE operation complete. Rows affected: ${deleteCount}`;
        if (deleteCount !== 1) throw new Error("DELETE failed.");

        results.transaction = {};
        const user_id = uuid.v4();
        const log_id = uuid.v4();

        // 7a. Test a successful transaction
        try {
            await db.transaction(DB_NAME, async (client) => {
                // Inside this callback, all queries are part of the same transaction.
                await client.execute('INSERT INTO public."Test" (idstr, name, type) VALUES ($1, $2, $3)', [user_id, 'Test User', 'user']);
                await client.execute('INSERT INTO public."Test" (idstr, name, type) VALUES ($1, $2, $3)', [log_id, 'User created log entry', 'log']);
            });
            const successCount = await db.query.one(DB_NAME, 'SELECT COUNT(*) as count FROM public."Test"');
            results.transaction.success_test = `PASS: Transaction committed. Final record count: ${successCount.count}`;
            if (parseInt(successCount.count, 10) !== 2) throw new Error("Successful transaction failed.");
        } catch (e) {
            results.transaction.success_test = `FAIL: A successful transaction threw an error: ${e.message}`;
        }


        // 7b. Test a failing transaction (ROLLBACK)
        try {
            await db.transaction(DB_NAME, async (client) => {
                // This first insert should be rolled back.
                await client.execute('INSERT INTO public."Test" (idstr, name, type) VALUES ($1, $2, $3)', [uuid.v4(), 'Another User', 'user']);

                // This second insert will fail because the 'id' column has a UNIQUE constraint (it's a PRIMARY KEY)
                // and we are deliberately re-using an existing id.
                await client.execute('INSERT INTO public."Test" (idstr, name, type) VALUES ($1, $2, $3)', [user_id, 'Duplicate ID log', 'log']);
            });
            // This line should not be reached.
            results.transaction.rollback_test = "FAIL: A failing transaction did not throw an error.";

        } catch (err) {
            // We EXPECT an error here. Now we verify that the rollback was successful.
            const rollbackCount = await db.query.one(DB_NAME, 'SELECT COUNT(*) as count FROM public."Test"');
            if (parseInt(rollbackCount.count, 10) === 2) {
                results.transaction.rollback_test = `PASS: Transaction correctly rolled back. Final record count is still ${rollbackCount.count}.`;
            } else {
                results.transaction.rollback_test = `FAIL: Transaction did not roll back correctly. Record count is ${rollbackCount.count} but should be 2.`;
            }
        }

        $g.response.send(results);
    });
};
```

## DB - SQLite
Performs a full CRUD and transaction rollback test against a SQLite database file.

```javascript
module.exports = async function () {
    ginger(async function ($g) {
        const db = require('db');
        const uuid = require('uuid');

        const DB_NAME = 'testsqlitedb'; //as configured in app.json
        const results = {};

        // --- 1. SETUP: Drop old table and create a new one ---
        // Note the SQLite-compatible data types (TEXT, BLOB, REAL, INTEGER)
        await db.execute(DB_NAME, 'DROP TABLE IF EXISTS "Test"');
        await db.execute(DB_NAME, `
            CREATE TABLE "Test" (
                "idstr" TEXT PRIMARY KEY,
                "uuid" TEXT,
                "ip" TEXT,
                "json" TEXT,
                "inta" INTEGER[],
                "bool" INTEGER,
                "sint" INTEGER,
                "int" INTEGER,
                "bint" INTEGER,
                "float" REAL,
                "double" REAL,
                "numeric" REAL,
                "string" TEXT,
                "text" TEXT,
                "ts" TEXT,
                "tstz" TEXT,
                "date" TEXT,
                "bytea" BLOB
            )
        `);
        results.setup = "SQLite table 'Test' created successfully.";

        // --- 2. PREPARE DATA ---
        // For SQLite, arrays and JSON are stored as stringified JSON.
        const recordId = uuid.v4();
        const now = new Date();
        const originalRecord = {
            idstr: recordId,
            uuid: uuid.v4(),
            ip: '192.168.1.1',
            json: JSON.stringify({ key: 'value' }),
            inta: JSON.stringify([100, 200]),
            bool: 1, // Store booleans as 1 or 0
            sint: 12,
            int: 12345,
            bint: 9007199254740991, // Can be a number if within safe integer range
            float: 4.56,
            double: 7.89,
            numeric: 987.65,
            string: 'Hello SQLite',
            text: 'This is a long text field.',
            ts: now.toISOString(),
            tstz: now.toISOString(),
            date: '2024-01-15',
            bytea: Buffer.from('hello binary')
        };

        // --- 3. CREATE (INSERT) ---
        const insertSql = `INSERT INTO "Test" (${Object.keys(originalRecord).map(k => `"${k}"`).join(',')}) 
                       VALUES (${Object.keys(originalRecord).map(() => '?').join(',')})`;
        const insertParams = Object.values(originalRecord);
        const insertCount = await db.execute(DB_NAME, insertSql, insertParams);
        results.create = `INSERT successful. Rows affected: ${insertCount}`;

        // --- 4. READ and VERIFY ---
        const retrievedRecord = await db.query.one(DB_NAME, 'SELECT * FROM "Test" WHERE "idstr" = $1', [recordId]);
        results.read = "Read record successfully.";
        if (retrievedRecord.string !== 'Hello SQLite' || JSON.parse(retrievedRecord.inta)[1] !== 200) {
            throw new Error("Data verification failed.");
        }
        results.verify = "Data verification successful.";

        // --- 5. UPDATE ---
        const newStringValue = 'Hello SQLite, now updated!';
        const newIntValue = 250;
        const updateSql = 'UPDATE "Test" SET "string" = $1, "int" = $2 WHERE "idstr" = $3';
        const updateCount = await db.execute(DB_NAME, updateSql, [newStringValue, newIntValue, recordId]);
        results.update = `UPDATE successful. Rows affected: ${updateCount}`;
        if (updateCount !== 1) throw new Error("UPDATE failed to affect any rows.");

        // --- 6. READ after UPDATE to verify changes ---
        const updatedRecord = await db.query.one(DB_NAME, 'SELECT * FROM "Test" WHERE "idstr" = $1', [recordId]);
        if (updatedRecord.string !== newStringValue || updatedRecord.int !== newIntValue) {
            throw new Error("UPDATE verification failed. Data mismatch.");
        }
        results.read_after_update = "Verified successfully data after UPDATE.";

        // --- 7. DELETE ---
        const deleteCount = await db.execute(DB_NAME, 'DELETE FROM "Test" WHERE "idstr" = $1', [recordId]);
        results.delete = `DELETE successful. Rows affected: ${deleteCount}`;
        if (deleteCount !== 1) throw new Error("DELETE failed to affect any rows.");

        // --- 8. TRANSACTION TEST ---
        const user_id = uuid.v4();
        try {
            await db.transaction(DB_NAME, async (client) => {
                await client.execute('INSERT INTO "Test" ("idstr", "string") VALUES ($1, $2)', [user_id, 'tx_user']);
                // This will fail due to duplicate key constraint on idstr
                await client.execute('INSERT INTO "Test" ("idstr", "string") VALUES ($1, $2)', [recordId, 'tx_fail']);
            });
        } catch (e) {
            const count = await db.query.one(DB_NAME, 'SELECT COUNT(*) as count FROM "Test"');
            if (count.count === 1) {
                results.transaction = "PASS: Transaction correctly rolled back.";
            } else {
                results.transaction = `FAIL: Rollback failed. Row count: ${count.count}`;
            }
        }

        $g.response.send(results);
    });
};
```

## Encode
Tests all encoding and decoding functions (Base64, URI, Hex, HTML)

```javascript
module.exports = function () {
    ginger(function ($g) {
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

        const originalUrlParam = "node js & ginger tutorials?";
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
```

## File IO
Performs a full async and sync lifecycle test (Write, Read, Copy, Move, Delete) on a single file

```javascript
module.exports = async function () {
    ginger(async function ($g) {
        const fs = require('fs');

        const originalPath = 'temp/original.txt';
        const copyPath = 'temp/copy.txt';
        const movedPath = 'temp/moved.txt';

        //Async file operations
        const asyncResults = [];
        // --- 1. CREATE the original file ---
        await fs.writeFile(fs.BOX, originalPath, 'This is the original file.');
        asyncResults.push(`1. Wrote file to: ${originalPath}`);
        if (!fs.existsSync(fs.BOX, originalPath)) throw new Error("Original file was not created.");

        // --- 1a. VERIFY the original file ---
        const originalContent = await fs.readFile(fs.BOX, originalPath, 'utf8');
        if (originalContent !== 'This is the original file.') throw new Error("Original file content is incorrect.");
        asyncResults.push(`1a. Verified original file content: ${originalContent}`);

        // --- 2. COPY the file ---
        await fs.copyFile(fs.BOX, originalPath, fs.BOX, copyPath);
        asyncResults.push(`2. Copied file to: ${copyPath}`);
        if (!fs.existsSync(fs.BOX, copyPath)) throw new Error("Copied file does not exist.");

        // --- 3. MOVE (rename) the copied file ---
        await fs.moveFile(fs.BOX, copyPath, fs.BOX, movedPath);
        asyncResults.push(`3. Moved file to: ${movedPath}`);
        if (fs.existsSync(fs.BOX, copyPath)) throw new Error("Old copied file still exists after move.");
        if (!fs.existsSync(fs.BOX, movedPath)) throw new Error("Moved file does not exist.");

        // --- 4. DELETE both remaining files ---
        await Promise.all([
            fs.deleteFile(fs.BOX, originalPath),
            fs.deleteFile(fs.BOX, movedPath)
        ]);
        asyncResults.push(`4. Deleted both files: ${originalPath} and ${movedPath}`);
        if (fs.existsSync(fs.BOX, originalPath) || fs.existsSync(fs.BOX, movedPath)) {
            throw new Error("Files were not deleted correctly.");
        }
        asyncResults.push("\nSUCCESS: Full async file lifecycle completed successfully.");


        //Synchronous file operations
        const results = [];
        // --- 1. CREATE the original file ---
        fs.writeFileSync(fs.BOX, originalPath, 'This is the original file.');
        results.push(`1. Synchronously wrote file to: ${originalPath}`);
        if (!fs.existsSync(fs.BOX, originalPath)) throw new Error("Original file was not created synchronously.");

        // --- 1a. VERIFY the original file ---
        const originalContentSync = fs.readFileSync(fs.BOX, originalPath, 'utf8');
        if (originalContentSync !== 'This is the original file.') throw new Error("Original file content is incorrect.");
        results.push(`1a. Verified original file content: ${originalContentSync}`);

        // --- 2. COPY the file ---
        fs.copyFileSync(fs.BOX, originalPath, fs.BOX, copyPath);
        results.push(`2. Synchronously copied file to: ${copyPath}`);
        if (!fs.existsSync(fs.BOX, copyPath)) throw new Error("Copied file does not exist synchronously.");

        // --- 3. MOVE (rename) the copied file ---
        fs.moveFileSync(fs.BOX, copyPath, fs.BOX, movedPath);
        results.push(`3. Synchronously moved file to: ${movedPath}`);
        if (fs.existsSync(fs.BOX, copyPath)) throw new Error("Old copied file still exists after synchronous move.");
        if (!fs.existsSync(fs.BOX, movedPath)) throw new Error("Moved file does not exist synchronously.");
        
        // --- 4. DELETE both remaining files ---
        fs.deleteFileSync(fs.BOX, originalPath);
        fs.deleteFileSync(fs.BOX, movedPath);
        results.push(`4. Synchronously deleted both files: ${originalPath} and ${movedPath}`);
        if (fs.existsSync(fs.BOX, originalPath) || fs.existsSync(fs.BOX, movedPath)) {
            throw new Error("Files were not deleted correctly synchronously.");
        }

        results.push("\nSUCCESS: Full sync file lifecycle completed successfully.");

        $g.response.send({ status: 'success', async_lifecycle_events: asyncResults, sync_lifecycle_events: results });
    });
};
```

## Folder IO
Performs a full async and sync lifecycle test (MkDir, Copy, Move, RmDir) on a directory structure

```javascript
module.exports = async function () {
    ginger(async function ($g) {
        const fs = require('fs');
        const basePath = 'folder_tests';
        const originalDir = `${basePath}/original`;
        const copyDir = `${basePath}/copy`;
        const movedDir = `${basePath}/final_location`;

        // Async folder operations
        const results = [];
        // --- 0. Cleanup from previous runs ---
        if (fs.existsSync(fs.BOX, basePath)) {
            await fs.rmdir(fs.BOX, basePath, { recursive: true });
            results.push("0. Cleaned up old test directory.");
        }

        // --- 1. CREATE the directory structure ---
        await fs.mkdir(fs.BOX, `${originalDir}/subdir`);
        await fs.writeFile(fs.BOX, `${originalDir}/file1.txt`, 'hello');
        await fs.writeFile(fs.BOX, `${originalDir}/subdir/file2.txt`, 'world');
        results.push(`1. Created directory structure in '${originalDir}'.`);
        if (!fs.existsSync(fs.BOX, `${originalDir}/subdir/file2.txt`)) throw new Error("Dir creation failed.");

        // --- 2. COPY the entire folder ---
        await fs.copyDir(fs.BOX, originalDir, fs.BOX, copyDir);
        results.push(`2. Recursively copied '${originalDir}' to '${copyDir}'.`);
        if (!fs.existsSync(fs.BOX, `${copyDir}/subdir/file2.txt`)) throw new Error("Recursive copy failed.");

        // --- 3. MOVE the copied folder ---
        await fs.moveDir(fs.BOX, copyDir, fs.BOX, movedDir);
        results.push(`3. Moved '${copyDir}' to '${movedDir}'.`);
        if (fs.existsSync(fs.BOX, copyDir)) throw new Error("Old copy directory still exists after move.");
        if (!fs.existsSync(fs.BOX, `${movedDir}/subdir/file2.txt`)) throw new Error("Moved directory content is missing.");

        // --- 4. DELETE folders ---
        // Attempt to delete non-empty folder (should fail)
        let didFail = false;
        try {
            await fs.rmdir(fs.BOX, originalDir); // No { recursive: true }
        } catch (e) {
            didFail = true;
            results.push(`4a. Correctly failed to delete non-empty directory '${originalDir}'.`);
        }
        if (!didFail) throw new Error("Should have failed to delete non-empty directory.");

        // Recursively delete both remaining folder trees
        await Promise.all([
            fs.rmdir(fs.BOX, originalDir, { recursive: true }),
            fs.rmdir(fs.BOX, movedDir, { recursive: true })
        ]);
        results.push("4b. Successfully deleted all remaining directories recursively.");
        if (fs.existsSync(fs.BOX, originalDir) || fs.existsSync(fs.BOX, movedDir)) {
            throw new Error("Recursive delete failed.");
        }

        results.push("\nSUCCESS: Full async folder lifecycle completed successfully.");

        // Synchronous folder operations
        const syncResults = [];
        
        // --- 0. Cleanup from previous runs ---
        if (fs.existsSync(fs.BOX, basePath)) {
            fs.rmdirSync(fs.BOX, basePath, { recursive: true });
            syncResults.push("0. Cleaned up old test directory.");
        }

        // --- 1. CREATE the directory structure ---
        fs.mkdirSync(fs.BOX, `${originalDir}/subdir`);
        fs.writeFileSync(fs.BOX, `${originalDir}/file1.txt`, 'hello');
        fs.writeFileSync(fs.BOX, `${originalDir}/subdir/file2.txt`, 'world');
        syncResults.push(`1. Synchronously created directory structure in '${originalDir}'.`);
        if (!fs.existsSync(fs.BOX, `${originalDir}/subdir/file2.txt`)) throw new Error("Synchronous dir creation failed.");

        // --- 2. COPY the entire folder ---
        fs.copyDirSync(fs.BOX, originalDir, fs.BOX, copyDir);
        syncResults.push(`2. Synchronously copied '${originalDir}' to '${copyDir}'.`);
        if (!fs.existsSync(fs.BOX, `${copyDir}/subdir/file2.txt`)) throw new Error("Synchronous recursive copy failed.");

        // --- 3. MOVE the copied folder ---
        fs.moveDirSync(fs.BOX, copyDir, fs.BOX, movedDir);
        syncResults.push(`3. Synchronously moved '${copyDir}' to '${movedDir}'.`);
        if (fs.existsSync(fs.BOX, copyDir)) throw new Error("Old copy directory still exists after synchronous move.");
        if (!fs.existsSync(fs.BOX, `${movedDir}/subdir/file2.txt`)) throw new Error("Synchronous moved directory content is missing.");

        // --- 4. DELETE folders ---
        // Attempt to delete non-empty folder (should fail)
        didFail = false;
        try {
            fs.rmdirSync(fs.BOX, originalDir); // No { recursive: true }
        } catch (e) {
            didFail = true;
            syncResults.push(`4a. Correctly failed to delete non-empty directory '${originalDir}'.`);
        }
        if (!didFail) throw new Error("Should have failed to delete non-empty directory.");

        // Recursively delete both remaining folder trees
        fs.rmdirSync(fs.BOX, originalDir, { recursive: true });
        fs.rmdirSync(fs.BOX, movedDir, { recursive: true });
        syncResults.push("4b. Successfully deleted all remaining directories recursively.");
        if (fs.existsSync(fs.BOX, originalDir) || fs.existsSync(fs.BOX, movedDir)) {
            throw new Error("Recursive delete failed.");
        }

        syncResults.push("\nSUCCESS: Full synchronous folder lifecycle completed successfully.");

        $g.response.send({
            status: 'success',
            async_folder_lifecycle_events: results,
            sync_folder_lifecycle_events: syncResults
        });
    });
};
```

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
