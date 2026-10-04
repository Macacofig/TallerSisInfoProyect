const authService = require("../services/auth.service");
const scraperService = require("../services/scraper.service");

const fs = require("fs/promises");
const path = require("path");

async function iniciarSesion(req, res) {
    try {
        const resultado = await authService.iniciarSesion();

        res.json(resultado);
    } catch (error) {
        console.error("Error en el inicio de sesión:", error);

        res.status(500).json({
            error: "No se pudo completar el inicio de sesión",
            detalle: error.message
        });
    }
}

async function extraer(req, res) {
    try {
        const { programa, periodo, carrera } = req.body;

        const filtros = await scraperService.aplicarFiltros({
            programa,
            periodo,
            carrera
        });

        const materias = await scraperService.extraerMaterias();

        const directorio = path.resolve(__dirname, "../../data");

        await fs.mkdir(directorio, {
            recursive: true
        });

        const archivo = path.join(
            directorio,
            "materias.json"
        );

        const datos = {
            fechaExtraccion: new Date().toISOString(),
            filtros,
            total: materias.length,
            materias
        };

        await fs.writeFile(
            archivo,
            JSON.stringify(datos, null, 2),
            "utf8"
        );

        res.json({
            mensaje: "Extracción completada y guardada",
            total: materias.length,
            archivo: "data/materias.json"
        });

    } catch (error) {
        console.error("Error en la extracción:", error);

        res.status(500).json({
            error: "No se pudo completar la extracción",
            detalle: error.message
        });
    }
}

module.exports = {
    iniciarSesion,
    extraer
};