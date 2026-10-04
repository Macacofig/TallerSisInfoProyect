
const browserService = require("./browser.service");
const scraperService = require("./scraper.service");
const config = require("../config/scraper.config");

async function iniciarSesion() {
    const page = await browserService.iniciar();

    await page.goto(config.urls.login);

    // Esperar a que el usuario inicie sesión.
    await page.waitForURL(
        /\/inicio(?:[/?#]|$)/,
        { timeout: 120000 }
    );

    // Ir automáticamente a la oferta.
    await page.goto(config.urls.oferta);

    // Esperar a que la tabla esté disponible.
    await page.locator("table.mat-table").first().waitFor({
        state: "visible",
        timeout: 30000
    });

    // Obtener los filtros disponibles.
    const filtros = await scraperService.extraerFiltros();

    return {
        mensaje: "Sesión iniciada correctamente",
        url: page.url(),
        filtros
    };
}

async function navegarOferta() {
    const page = browserService.obtenerPagina();

    await page.goto(config.urls.oferta);

    return {
        mensaje: "Oferta de materias abierta",
        url: page.url()
    };
}

module.exports = {
    iniciarSesion
};