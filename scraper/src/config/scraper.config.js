require("dotenv").config();

module.exports = {
    port: Number(process.env.PORT) || 3000,

    urls: {
        login: "https://academico.ucb.edu.bo/AcademicoNacional/login",
        oferta: "https://academico.ucb.edu.bo/AcademicoNacional/administracion/ofertaDeMaterias"
    },

    browser: {
        headless: false
    }
};