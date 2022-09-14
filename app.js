const fs = require('fs');
const https = require('https');
const puppeteer = require('puppeteer');

async function run() {
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();
    await page.setViewport({
        width: 1200,
        height: 800
    });
    await page.goto('https://www.carrefour.it/spesa-online/frutta-e-verdura/#size=450', {waitUntil: "domcontentloaded"});


    await new Promise(resolve => setTimeout(resolve, 150000));

    await autoScroll(page);

    data = await page.evaluate(() => {
        root = Array.from(document.querySelectorAll('.product-link'));
        return root.map(el => ({
            name: el.querySelector('.tile-description').innerHTML,
            src: el.querySelector('.tile-image').getAttribute('src')
        }))

    });
    data = data.filter(el => el.src);

    for await (const product of data) {
        console.log("https://www.carrefour.it" + product.src + ' ------> ' + product.name);
        var viewSource = await page.goto("https://www.carrefour.it" + product.src);

        if (!fs.existsSync('output')) {
            fs.mkdir('output', {recursive: true}, (err) => {
                if (err) throw err;
            });
        }
        try {

            fs.writeFile(`output/${product.name}.jpg`, await viewSource.buffer(), function (err) {
                if (err) {
                    return console.log(err);
                }
                console.log("The file was saved!");
            });
        } catch (e) {
            console.warn(e)
        }

    }


    await browser.close();


}

run();

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            var totalHeight = 0;
            var distance = 1000;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight - window.innerHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}
