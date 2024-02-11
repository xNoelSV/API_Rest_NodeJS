// Importar dependencias
const express = require("express");

// Cargar router
const router = express.Router();

// Importar middleware
const { auth } = require("../middlewares/auth");

// Importar controlador
const AlbumController = require("../controllers/album");

// Configuración de subida
const multer = require("multer");
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/albums/");
    },
    filename: (req, file, cb) => {
        cb(null, "album-" + Date.now() + "-" + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Definir rutas
router.get("/prueba", AlbumController.prueba);
router.post("/save", auth, AlbumController.save);
router.get("/one/:id", auth, AlbumController.one);
router.get("/list/:artistId", auth, AlbumController.list);
router.put("/update/:albumId", auth, AlbumController.update);
router.post("/upload/:albumId", [auth, upload.single("file0")], AlbumController.upload);
router.get("/image/:file", AlbumController.image);
router.delete("/remove/:albumId", auth, AlbumController.remove);


// Exportar router
module.exports = router;