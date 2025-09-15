module.exports = async function () {
    gingee(async function ($g) {
        const fs = require('fs');
        const html = require('html');

        const results = {};

        // --- 1. Test fromString ---
        const htmlString = `
        <div>
            <h2 class="title">Title from String</h2>
            <p>Some paragraph text.</p>
        </div>
        `;
        const $fromString = html.fromString(htmlString);
        results.from_string_test = {
            title: $fromString('.title').text()
        };

        // --- 2. Test fromFile (Async) ---
        const $fromFile = await html.fromFile(fs.BOX, './assets/testselect.html');
        results.from_file_test = {
            h1_text: $fromFile('h1').text(),
            first_li_text: $fromFile('#item-1').text()
        };

        // --- 3. Test fromUrl (Async) ---
        // We will scrape a real, simple HTML page from the web.
        const $fromUrl = await html.fromUrl('https://info.cern.ch/hypertext/WWW/TheProject.html');
        // This page has a <header> element with a <title> inside it.
        const pageTitle = $fromUrl('header title').text();
        results.from_url_test = {
            scraped_url: 'https://info.cern.ch/hypertext/WWW/TheProject.html',
            page_title: pageTitle
        };

        $g.response.send(results);
    });
};
