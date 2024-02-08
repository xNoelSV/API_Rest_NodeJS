const express = require("express");
const router = express.Router();
const multer = require("multer");
const UserController = require("../controllers/user");
const { auth } = require("../middelwares/auth");

// Configuración de subida
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/avatars/");
    },
    filename: (req, file, cb) => {
        cb(null, "avatar-"+Date.now()+"-"+file.originalname);
    }
});
const uploads = multer({storage});

// Definir rutas
router.get("/prueba-usuario", auth, UserController.pruebaUser);
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/profile/:id", auth, UserController.profile);
router.get("/list/:page?", auth, UserController.list);
router.put("/update", auth, UserController.update);
router.post("/upload", [auth, uploads.single("file0")], UserController.upload);
router.get("/avatar/:file", UserController.avatar);
router.get("/counters/:id?", auth, UserController.counters);

// Exportar router
module.exports = router;