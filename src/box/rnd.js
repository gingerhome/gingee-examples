module.exports = async function () {
    gingee(async function ($g) {
        const { rnd } = require('utils');
        const testArray = ['apple', 'banana', 'cherry', 'date', 'elderberry'];

        const result = {
            numeric: {
                "int(10)": rnd.int(10),
                "float(10)": rnd.float(10),
                "intInRange(50, 100)": rnd.intInRange(50, 100),
                "floatInRange(50, 100)": rnd.floatInRange(50, 100),
            },
            boolean: {
                "bool()": rnd.bool(),
                "another bool()": rnd.bool(),
            },
            array: {
                original_array: testArray.join(', '),
                "choice(array)": rnd.choice(testArray),
                // Note: shuffle modifies the array in place, so we pass a copy to preserve the original for display.
                "shuffle(array)": rnd.shuffle([...testArray]),
            },
            visual: {
                "color()": rnd.color(),
                "another color()": rnd.color(),
            },
            string: {
                "short": rnd.string(6),
                "long": rnd.string(12),
            }
        };

        $g.response.send(result);
    });
};
