// Importar dependencias
const express = require("express");

// Cargar router
const router = express.Router();

// Importar controlador
const AlbumController = require("../controllers/album");

// Definir rutas
router.get("/prueba", AlbumController.prueba);

// Exportar router
module.exports = router;