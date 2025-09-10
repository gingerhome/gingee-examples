module.exports = async function () {
    gingee(async function ($g) {
        const db = require('db');
        const uuid = require('uuid');

        const DB_NAME = 'testmssqldb'; //as configured in app.json
        const results = {};
        results.status = "MSSQL not tested yet";

        /*
        // --- 1. SETUP: Drop old table and create a new one ---
        await db.execute(DB_NAME, `IF OBJECT_ID('Test', 'U') IS NOT NULL DROP TABLE Test`);
        await db.execute(DB_NAME, `
            CREATE TABLE Test (
                idstr NVARCHAR(36) PRIMARY KEY,
                string_val NVARCHAR(255),
                int_val INT,
                bool_val BIT,
                json_val NVARCHAR(MAX) CHECK(ISJSON(json_val)>0),
                ts_val DATETIME2,
                bytea_val VARBINARY(MAX)
            )
        `);
        results.setup = "MS SQL table 'Test' created successfully.";

        // --- 2. CREATE (INSERT) ---
        const recordId = uuid.v4();
        const originalRecord = {
            idstr: recordId,
            string_val: 'Hello MS SQL',
            int_val: 777,
            bool_val: 1, // Use 1 for true
            json_val: JSON.stringify({ a: 1, b: "test" }),
            ts_val: new Date(),
            bytea_val: Buffer.from('hello binary'),
        };

        // Note: We still write developer-friendly PostgreSQL-style SQL here.
        const insertSql = 'INSERT INTO "Test" ("idstr", "string_val", "int_val", "bool_val", "json_val", "ts_val", "bytea_val") VALUES ($1, $2, $3, $4, $5, $6, $7)';
        const insertCount = await db.execute(DB_NAME, insertSql, Object.values(originalRecord));
        results.create = `CREATE successful. Rows affected: ${insertCount}`;

        // --- 3. READ ---
        const retrievedRecord = await db.query.one(DB_NAME, 'SELECT * FROM "Test" WHERE "idstr" = $1', [recordId]);
        results.read = { description: "READ successful.", data: retrievedRecord };
        if (retrievedRecord.int_val !== 777) throw new Error("Data verification failed.");

        // --- 4. UPDATE ---
        const updateSql = 'UPDATE "Test" SET "string_val" = $1 WHERE "idstr" = $2';
        const updateCount = await db.execute(DB_NAME, updateSql, ['Value was updated!', recordId]);
        results.update = `UPDATE successful. Rows affected: ${updateCount}`;

        // --- 5. DELETE ---
        const deleteCount = await db.execute(DB_NAME, 'DELETE FROM "Test" WHERE "idstr" = $1', [recordId]);
        results.delete = `DELETE successful. Rows affected: ${deleteCount}`;

        // --- 6. TRANSACTION TEST ---
        const tx_user_id = uuid.v4();
        let tx_rollback_ok = false;
        try {
            await db.transaction(DB_NAME, async (client) => {
                await client.execute('INSERT INTO "Test" ("idstr") VALUES ($1)', [tx_user_id]);
                // This will fail due to primary key constraint
                await client.execute('INSERT INTO "Test" ("idstr") VALUES ($1)', [tx_user_id]);
            });
        } catch (e) {
            const result = await db.query.one(DB_NAME, 'SELECT COUNT(*) as count FROM "Test"');
            if (result.count === 0) {
                tx_rollback_ok = true;
            }
        }
        results.transaction = tx_rollback_ok ? "PASS: Transaction correctly rolled back." : "FAIL: Rollback failed.";
        */

        $g.response.send(results);
    });
};
