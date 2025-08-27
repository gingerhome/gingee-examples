module.exports = function () {
    ginger(async function ($g) {
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
