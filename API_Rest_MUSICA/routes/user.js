// Importar dependencias
const express = require("express");

// Cargar router
const router = express.Router();

// Importar controlador
const UserController = require("../controllers/user");

// Definir rutas
router.get("/prueba", UserController.prueba);
router.post("/register", UserController.register);
router.post("/login", UserController.login);

// Exportar router
module.exports = router;