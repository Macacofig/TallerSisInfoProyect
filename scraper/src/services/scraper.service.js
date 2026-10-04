
const browserService = require("./browser.service");

async function seleccionarFiltro(page, selector, valor) {
    const filtro = page.locator(selector);

    await filtro.click();

    const opciones = page.locator("mat-option");

    await opciones.first().waitFor({
        state: "visible",
        timeout: 10000
    });

    const opcion = opciones.filter({
        hasText: valor
    }).first();

    await opcion.waitFor({
        state: "visible",
        timeout: 10000
    });

    await opcion.click();
}

async function aplicarFiltros({ programa, periodo, carrera }) {
    const page = browserService.obtenerPagina();

    await seleccionarFiltro(
        page,
        '[formcontrolname="idTipoSubDepartamento"]',
        programa
    );

    await seleccionarFiltro(
        page,
        '[formcontrolname="idPeriodoAcademico"]',
        periodo
    );

    await seleccionarFiltro(
        page,
        '[formcontrolname="idCarrera"]',
        carrera
    );

    return { programa, periodo, carrera };
}


async function extraerTextoCelda(celda) {
    const parrafo = celda.locator("p").first();

    if (await parrafo.count()) {
        return (await parrafo.innerText()).trim();
    }

    return "";
}

async function extraerHorarios(celda) {
    const tabla = celda.locator("table.mat-table").first();

    if (!(await tabla.count())) {
        return [];
    }

    const filas = tabla.locator(":scope > tbody > tr.mat-row");
    const cantidad = await filas.count();
    const horarios = [];

    for (let i = 0; i < cantidad; i++) {
        const celdas = filas.nth(i).locator(":scope > td");

        horarios.push({
            tipoDocente: await extraerTextoCelda(celdas.nth(0)),
            docente: await extraerTextoCelda(celdas.nth(1)),
            dia: await extraerTextoCelda(celdas.nth(2)),
            horas: await extraerTextoCelda(celdas.nth(3)),
            aula: await extraerTextoCelda(celdas.nth(4))
        });
    }

    return horarios;
}

async function extraerMaterias() {
    const page = browserService.obtenerPagina();
    const tabla = page.locator("table.mat-table").first();

    await tabla.waitFor({ state: "visible" });

    const filas = tabla.locator(":scope > tbody > tr.mat-row");
    const cantidad = await filas.count();
    const materias = [];

    for (let i = 0; i < cantidad; i++) {
        const celdas = filas.nth(i).locator(":scope > td");

        materias.push({
            numero: await extraerTextoCelda(celdas.nth(0)),
            sigla: await extraerTextoCelda(celdas.nth(1)),
            paralelo: await extraerTextoCelda(celdas.nth(2)),
            asignatura: await extraerTextoCelda(celdas.nth(3)),
            cargaAcademica: await extraerTextoCelda(celdas.nth(4)),
            uve: await extraerTextoCelda(celdas.nth(5)),
            cupo: await extraerTextoCelda(celdas.nth(6)),
            inscritos: await extraerTextoCelda(celdas.nth(7)),
            reservas: await extraerTextoCelda(celdas.nth(8)),
            inscritosReservas: await extraerTextoCelda(celdas.nth(9)),
            tipo: await extraerTextoCelda(celdas.nth(10)),
            carrerasAsignadas: await extraerTextoCelda(celdas.nth(11)),
            horarios: await extraerHorarios(celdas.nth(12))
        });
    }

    return materias;
}

async function extraerFiltros() {
    const page = browserService.obtenerPagina();

    const programas = await obtenerOpcionesFiltro(
        page,
        '[formcontrolname="idTipoSubDepartamento"]'
    );

    const periodos = await obtenerOpcionesFiltro(
        page,
        '[formcontrolname="idPeriodoAcademico"]'
    );

    const carreras = await obtenerOpcionesFiltro(
        page,
        '[formcontrolname="idCarrera"]'
    );

    return {
        programas,
        periodos,
        carreras
    };
}

async function obtenerOpcionesFiltro(page, selector) {
    const filtro = page.locator(selector);

    await filtro.click();

    const opciones = page.locator("mat-option");

    await opciones.first().waitFor({
        state: "visible",
        timeout: 10000
    });

    const valores = await opciones.allInnerTexts();

    // Cerrar el menú
    await page.keyboard.press("Escape");

    return valores
        .map(valor => valor.trim())
        .filter(valor => valor !== "");
}
module.exports = {
    aplicarFiltros,
    extraerMaterias,
    extraerFiltros
};