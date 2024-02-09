// Importar dependencias
const express = require("express");

// Cargar router
const router = express.Router();

// Importar controlador
const ArtistController = require("../controllers/artist");

// Definir rutas
router.get("/prueba", ArtistController.prueba);

// Exportar router
module.exports = router;