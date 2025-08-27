module.exports = async function () {
    ginger(async function ($g) {
        const uuid = require('uuid');
        const results = {
            // --- UUID TESTS ---
            uuid_tests: {
                "v4()": uuid.v4(),
                "validate(v4())": uuid.validate(uuid.v4()),
                "validate('invalid-uuid')": uuid.validate('invalid-uuid'),
            }
        };
        $g.response.send(results);
    });
};
