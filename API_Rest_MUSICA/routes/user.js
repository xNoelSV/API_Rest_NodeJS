// Importar dependencias
const express = require("express");
const { auth } = require("../middlewares/auth");

// Cargar router
const router = express.Router();

// Importar controlador
const UserController = require("../controllers/user");

// Configuración de subida
const multer = require("multer");
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/avatars/");
    },
    filename: (req, file, cb) => {
        cb(null, "avatar-" + Date.now() + "-" + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Definir rutas
router.get("/prueba", auth, UserController.prueba);
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/profile/:id", auth, UserController.profile);
router.put("/update", auth, UserController.update);
router.post("/upload", [auth, upload.single("file0")], UserController.upload);
router.get("/avatar/:file", UserController.avatar);

// Exportar router
module.exports = router;