module.exports = async function () {
    gingee(async function ($g) {
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
