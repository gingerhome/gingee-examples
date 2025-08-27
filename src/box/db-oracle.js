module.exports = async function () {
    ginger(async function ($g) {
        const db = require('db');
        const uuid = require('uuid');

        const DB_NAME = 'testoracledb'; //as configured in app.json
        const results = {};
        results.status = "OracleDB not tested yet";

        /*
        // --- 1. SETUP: Drop old table and create a new one ---
        // Using Oracle-compatible data types. Note table/column names are case-insensitive here.
        try { 
            await db.execute(DB_NAME, 'DROP TABLE Test'); 
        } catch (e) { 
            // ignore if table doesnt exist
        }
        await db.execute(DB_NAME, `
            CREATE TABLE Test (
                idstr VARCHAR2(36) PRIMARY KEY,
                string_val VARCHAR2(255),
                int_val NUMBER(10),
                bool_val NUMBER(1),
                json_val CLOB,
                ts_val TIMESTAMP,
                bytea_val BLOB
            )
        `);
        results.setup = "Oracle table 'Test' created successfully.";

        // --- 2. CREATE (INSERT) ---
        const recordId = uuid.v4();
        const originalRecord = {
            idstr: recordId,
            string_val: 'Hello Oracle',
            int_val: 1234,
            bool_val: 1, // Use 1 for true
            json_val: JSON.stringify({ a: 1, b: "test" }),
            ts_val: new Date(),
            bytea_val: Buffer.from('hello binary'),
        };

        // Developer still writes PostgreSQL-style SQL. The adapter handles the rest.
        const insertSql = 'INSERT INTO Test (idstr, string_val, int_val, bool_val, json_val, ts_val, bytea_val) VALUES ($1, $2, $3, $4, $5, $6, $7)';
        const insertCount = await db.execute(DB_NAME, insertSql, Object.values(originalRecord));
        results.create = `CREATE successful. Rows affected: ${insertCount}`;

        // --- 3. READ ---
        const retrievedRecord = await db.query.one(DB_NAME, 'SELECT * FROM Test WHERE idstr = $1', [recordId]);
        results.read = { description: "READ successful.", data: retrievedRecord };
        if (retrievedRecord.intVal !== 1234) throw new Error("Data verification failed."); // Note camelCase name

        // --- 4. UPDATE ---
        const updateCount = await db.execute(DB_NAME, 'UPDATE Test SET int_val = $1 WHERE idstr = $2', [5678, recordId]);
        results.update = `UPDATE successful. Rows affected: ${updateCount}`;

        // --- 5. DELETE ---
        const deleteCount = await db.execute(DB_NAME, 'DELETE FROM Test WHERE idstr = $1', [recordId]);
        results.delete = `DELETE successful. Rows affected: ${deleteCount}`;

        // --- 6. TRANSACTION TEST ---
        const tx_user_id = uuid.v4();
        let tx_rollback_ok = false;
        try {
            await db.transaction(DB_NAME, async (client) => {
                await client.execute('INSERT INTO Test (idstr) VALUES ($1)', [tx_user_id]);
                // This will fail due to primary key constraint
                await client.execute('INSERT INTO Test (idstr) VALUES ($1)', [tx_user_id]);
            });
        } catch (e) {
            const result = await db.query.one(DB_NAME, 'SELECT COUNT(*) as count FROM Test');
            if (result.count === 0) {
                tx_rollback_ok = true;
            }
        }
        results.transaction = tx_rollback_ok ? "PASS: Transaction correctly rolled back." : "FAIL: Rollback failed.";
        */

        $g.response.send(results);
    });
};
