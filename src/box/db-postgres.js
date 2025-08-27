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
