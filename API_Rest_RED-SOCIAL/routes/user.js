const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user");
const { auth } = require("../middelwares/auth");

// Definir rutas
router.get("/prueba-usuario", auth, UserController.pruebaUser);
router.post("/register", UserController.register);
router.post("/login", UserController.login);

// Exportar router
module.exports = router;