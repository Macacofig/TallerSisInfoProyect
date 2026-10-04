const { chromium } = require("playwright");
const config = require("../config/scraper.config");

let browser = null;
let page = null;

async function iniciar() {
    if (browser) {
        return page;
    }

    browser = await chromium.launch(config.browser);

    const context = await browser.newContext();

    page = await context.newPage();

    return page;
}

function obtenerPagina() {
    if (!page) {
        throw new Error("El navegador no está iniciado");
    }

    return page;
}

async function cerrar() {
    if (browser) {
        await browser.close();
        browser = null;
        page = null;
    }
}

module.exports = {
    iniciar,
    obtenerPagina,
    cerrar
};