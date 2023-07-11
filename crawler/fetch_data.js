const {JSDOM} = require('jsdom');
const fs = require('fs');

class SeasonPack {
    constructor(title, packs) {

    }
}

async function parse_support_pack(link) {
    try {
        const url = `https://www.poewiki.net${link}`;
        console.log(`parsing ${url}`);

        const response = await fetch(url);
        const html = await response.text();
        // Create a virtual DOM using JSDOM
        const dom = new JSDOM(html);
        const {document} = dom.window;

        // Select all the table elements (replace 'table.wikitable' with your own selector)
        const title = document.querySelector("h1").textContent
        const tables = document.querySelectorAll('table.wikitable');
        const map = {}
        //todo: support tiers mapping for a table, todo fix closed beta packs
        // Iterate over each table
        for (const table of tables) {
            // Select the rows within the table
            const rows = table.querySelectorAll('tr');

            // Skip the header row
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];

                // Select the cells within the row
                const cells = row.querySelectorAll('td');

                // Extract the price tier and name from the cells (adjust the indexes based on your table structure)
                if (cells.length <= 2)
                    continue

                const tier = cells[0].textContent.trim();
                const name = cells[1].textContent.trim();
                const price = cells[2].textContent.trim();
                // Extract the numeric portion from the price value
                const numericPrice = Number(price.match(/\d+/)[0]);
                map[name] = numericPrice;
                // Output the extracted price tier and name

            }
        }
        return {title: title, packs: map};
    } catch (error) {
        console.error('Error fetching HTML:', error);
        return []; // Return an empty array in case of an error
    }
}

function main() {
    // URL to fetch the HTML content from
    const url = 'https://www.poewiki.net/wiki/Supporter_pack';

// Make an HTTP GET request to fetch the HTML content
    fetch(url)
        .then(response => response.text())
        .then(html => {
            // Create a virtual DOM using JSDOM
            const dom = new JSDOM(html);
            const {document} = dom.window;

            // Select the table element (replace 'table.wikitable' with your own selector)
            const table = document.querySelector('table.wikitable');

            // Select all the anchor elements within the table
            const links = table.querySelectorAll('a');

            // Create an array to store the extracted URLs
            // Iterate over the selected elements and extract the href attribute
            const promises = []
            links.forEach((link) => {
                const url = link.href;
                const promise = parse_support_pack(url);
                promises.push(promise)
            });

            Promise.all(promises).then((vals) => {
                const outputMap = {}
                vals.forEach(p => {
                    outputMap['packs'] = {...outputMap.packs, ...p.packs};
                })
                fs.writeFile('packs.json', JSON.stringify(outputMap), (err) => {
                    if (err) throw err;
                    console.log('Data written to file');
                });
            })
        })
        .catch(error => {
            console.error('Error fetching HTML:', error);
        });

}

main();