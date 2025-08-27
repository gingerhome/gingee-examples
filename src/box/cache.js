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
