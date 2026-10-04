const { chromium } = require("playwright");

async function main() {
    const browser = await chromium.launch({
        headless: false
    });

    const page = await browser.newPage();

    await page.goto("https://www.google.com");

    console.log("Navegador iniciado correctamente");

    await page.waitForTimeout(5000);
    await browser.close();
}

main().catch(console.error);