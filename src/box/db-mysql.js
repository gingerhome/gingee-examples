module.exports = async function () {
    gingee(async function ($g) {
        const db = require('db');
        const uuid = require('uuid');

        const DB_NAME = 'testmysqldb'; //as configured in app.json
        const results = {};

        // --- 1. SETUP: Drop old table and create the new, complex one ---
        await db.execute(DB_NAME, 'DROP TABLE IF EXISTS Test');
        await db.execute(DB_NAME, `
            CREATE TABLE Test (
                idstr varchar(36) PRIMARY KEY,
                name varchar(100),
                type varchar(50),
                id int DEFAULT NULL,
                bool tinyint DEFAULT NULL,
                tint tinyint DEFAULT NULL,
                sint smallint DEFAULT NULL,
                int_val int DEFAULT NULL,
                bint bigint DEFAULT NULL,
                float_val float DEFAULT NULL,
                double_val double DEFAULT NULL,
                string varchar(45) DEFAULT NULL,
                text_val text,
                bytea longblob,
                ts datetime DEFAULT NULL,
                tstz timestamp NULL DEFAULT NULL,
                date_val date DEFAULT NULL,
                numeric_val decimal(10,0) DEFAULT NULL,
                json_val json DEFAULT NULL,
                uuid varchar(100) DEFAULT NULL,
                ip varchar(100) DEFAULT NULL
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
            id: 1,
            bool: true,
            tint: 12,
            sint: 34,
            int_val: 12345,
            bint: '9007199254740991', // Use string for bigints
            float_val: 4.56,
            double_val: 7.89123,
            string: 'Hello Varying',
            text_val: 'This is a long text field.',
            bytea: Buffer.from('hello binary'),
            ts: now,
            tstz: now,
            date_val: '2024-01-15',
            numeric_val: 987.65,
            json_val: { key: 'value', nested: { num: 123 } },
            uuid: uuid.v4(),
            ip: '192.168.1.1'
        };

        // --- 3. CREATE (INSERT) ---
        const insertSql = `INSERT INTO Test (${Object.keys(originalRecord).map(k => `${k}`).join(', ')}) 
                       VALUES (${Object.keys(originalRecord).map((_, i) => `$${i + 1}`).join(', ')})`;
        const insertParams = Object.values(originalRecord);
        const insertCount = await db.execute(DB_NAME, insertSql, insertParams);
        results.create = `INSERT operation complete. Rows affected: ${insertCount}`;
        if (insertCount !== 1) throw new Error("INSERT failed.");
        
        // --- 4. READ and VERIFY ---
        const retrievedRecord = await db.query.one(DB_NAME, 'SELECT * FROM Test WHERE idstr = $1', [recordId]);
        if (!retrievedRecord) throw new Error("READ failed. Record not found.");
        results.read = "Successfully read the record back from the database.";

        // Verification checks (a few examples)
        if (retrievedRecord.string !== 'Hello Varying') throw new Error("String type mismatch.");
        if (retrievedRecord.json_val.nested.num !== 123) throw new Error("JSON type mismatch.");
        if (!retrievedRecord.bytea.equals(Buffer.from('hello binary'))) throw new Error("Bytea type mismatch.");
        results.verify = "Data verification successful. Types were preserved correctly.";
        
        // --- 5. UPDATE ---
        const updateSql = 'UPDATE Test SET text_val = $1, string = $2 WHERE idstr = $3';
        const updateCount = await db.execute(DB_NAME, updateSql, ['This text has been updated.', 'Updated String', recordId]);
        results.update = `UPDATE operation complete. Rows affected: ${updateCount}`;

        const updatedRecord = await db.query.one(DB_NAME, 'SELECT text_val, string FROM Test WHERE idstr = $1', [recordId]);
        if (updatedRecord.text_val !== 'This text has been updated.' || updatedRecord.string !== 'Updated String') {
            throw new Error("UPDATE verification failed.");
        }
        results.read_after_update = { description: "Verified updated data.", data: updatedRecord };
        
        // --- 6. DELETE ---
        const deleteCount = await db.execute(DB_NAME, 'DELETE FROM Test WHERE idstr = $1', [recordId]);
        results.delete = `DELETE operation complete. Rows affected: ${deleteCount}`;
        if (deleteCount !== 1) throw new Error("DELETE failed.");

        // --- 7. TRANSACTION TEST ---
        results.transaction = {};
        const user_id = uuid.v4();
        const log_id = uuid.v4();

        // 7a. Test a successful transaction
        try {
            await db.transaction(DB_NAME, async (client) => {
                // Inside this callback, all queries are part of the same transaction.
                await client.execute('INSERT INTO Test (idstr, name, type) VALUES ($1, $2, $3)', [user_id, 'Test User', 'user']);
                await client.execute('INSERT INTO Test (idstr, name, type) VALUES ($1, $2, $3)', [log_id, 'User created log entry', 'log']);
            });
            const successCount = await db.query.one(DB_NAME, 'SELECT COUNT(*) as count FROM Test');
            results.transaction.success_test = `PASS: Transaction committed. Final record count: ${successCount.count}`;
            if (parseInt(successCount.count, 10) !== 2) throw new Error("Successful transaction failed.");
        } catch (e) {
            results.transaction.success_test = `FAIL: A successful transaction threw an error: ${e.message}`;
        }


        // 7b. Test a failing transaction (ROLLBACK)
        try {
            await db.transaction(DB_NAME, async (client) => {
                // This first insert should be rolled back.
                await client.execute('INSERT INTO Test (idstr, name, type) VALUES ($1, $2, $3)', [uuid.v4(), 'Another User', 'user']);

                // This second insert will fail because the 'id' column has a UNIQUE constraint (it's a PRIMARY KEY)
                // and we are deliberately re-using an existing id.
                await client.execute('INSERT INTO Test (idstr, name, type) VALUES ($1, $2, $3)', [user_id, 'Duplicate ID log', 'log']);
            });
            // This line should not be reached.
            results.transaction.rollback_test = "FAIL: A failing transaction did not throw an error.";

        } catch (err) {
            // We EXPECT an error here. Now we verify that the rollback was successful.
            const rollbackCount = await db.query.one(DB_NAME, 'SELECT COUNT(*) as count FROM Test');
            if (parseInt(rollbackCount.count, 10) === 2) {
                results.transaction.rollback_test = `PASS: Transaction correctly rolled back. Final record count is still ${rollbackCount.count}.`;
            } else {
                results.transaction.rollback_test = `FAIL: Transaction did not roll back correctly. Record count is ${rollbackCount.count} but should be 2.`;
            }
        }

        $g.response.send(results);
    });
};
