require("dotenv").config();

const express = require("express");
const config = require("./config/scraper.config");
const scraperRoutes = require("./routes/scraper.routes");
const browserService = require("./services/browser.service");

const app = express();

app.use(express.json());

app.use("/api/scraper", scraperRoutes);

const server = app.listen(config.port, () => {
    console.log(`Servidor iniciado en http://localhost:${config.port}`);
});

async function cerrarServidor() {
    console.log("Cerrando servidor...");

    await browserService.cerrar();

    server.close(() => {
        process.exit(0);
    });
}

process.on("SIGINT", cerrarServidor);
process.on("SIGTERM", cerrarServidor);