module.exports = async function () {
    ginger(async function ($g) {
        const { string, validate, misc } = require('utils');
        const dataForGrouping = [
            { category: 'fruit', name: 'apple' },
            { category: 'veg', name: 'carrot' },
            { category: 'fruit', name: 'banana' },
        ];
        const dataForInValidate = ['admin', 'editor', 'viewer'];

        const results = {
            // --- STRING TESTS ---
            string_tests: {
                "capitalize('hello there')": string.capitalize('hello there'),
                "slugify(' This is a -- Slug! ')": string.slugify(' This is a -- Slug! '),
                "truncate('long text that needs shortening', 20)": string.truncate('long text that needs shortening', 20),
                "stripHtml('<p><b>HTML</b> content</p>')": string.stripHtml('<p><b>HTML</b> content</p>'),
            },

            // --- VALIDATE TESTS ---
            validate_tests: {
                "isEmail('test@example.com')": validate.isEmail('test@example.com'),
                "isEmail('invalid-email')": validate.isEmail('invalid-email'),
                "isUrl('https://google.com')": validate.isUrl('https://google.com'),
                "isUrl('not a url')": validate.isUrl('not a url'),
                "isEmpty('')": validate.isEmpty(''),
                "isEmpty([])": validate.isEmpty([]),
                "isEmpty({})": validate.isEmpty({}),
                "isEmpty('  ')": validate.isEmpty('  '),
                "isEmpty('hello')": validate.isEmpty('hello'),
                "isPhoneNumber('+1 (555) 123-4567')": validate.isPhoneNumber('+1 (555) 123-4567'),
                "isPhoneNumber('5551234567')": validate.isPhoneNumber('5551234567'),
                "isPhoneNumber('abc')": validate.isPhoneNumber('abc'),

                "isInteger(10)": validate.isInteger(10),
                "isInteger(10.5)": validate.isInteger(10.5),
                "isInteger('10')": validate.isInteger('10'),

                "isInRange(5, 1, 10)": validate.isInRange(5, 1, 10),
                "isInRange(11, 1, 10)": validate.isInRange(11, 1, 10),

                "hasLength('abc', { exact: 3 })": validate.hasLength('abc', { exact: 3 }),
                "hasLength('abcd', { exact: 3 })": validate.hasLength('abcd', { exact: 3 }),
                "hasLength('password', { min: 8 })": validate.hasLength('password', { min: 8 }),
                "hasLength('pass', { min: 8 })": validate.hasLength('pass', { min: 8 }),
                "hasLength('comment', { max: 10 })": validate.hasLength('comment', { max: 10 }),
                "hasLength('long comment', { max: 10 })": validate.hasLength('long comment', { max: 10 }),

                "isAlphanumeric('user123')": validate.isAlphanumeric('user123'),
                "isAlphanumeric('user-123')": validate.isAlphanumeric('user-123'),

                "isIn('admin', roles)": validate.isIn('admin', dataForInValidate),
                "isIn('guest', roles)": validate.isIn('guest', dataForInValidate),
            },

            // --- MISC TESTS ---
            misc_tests: {
                "clamp(150, 0, 100)": misc.clamp(150, 0, 100),
                "clamp(-10, 0, 100)": misc.clamp(-10, 0, 100),
                "clamp(50, 0, 100)": misc.clamp(50, 0, 100),
                "groupBy(data, 'category')": misc.groupBy(dataForGrouping, 'category'),
            }
        };

        $g.response.send(results);
    });
};
