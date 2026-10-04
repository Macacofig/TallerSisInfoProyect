const express = require("express");

const controller = require("../controllers/scraper.controller");

const router = express.Router();

router.post("/login", controller.iniciarSesion);

router.post("/extraer", controller.extraer);

module.exports = router;