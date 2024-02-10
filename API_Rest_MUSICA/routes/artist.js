// Importar dependencias
const express = require("express");
const { auth } = require("../middlewares/auth");

// Cargar router
const router = express.Router();

// Importar controlador
const ArtistController = require("../controllers/artist");

// Configuración de subida
const multer = require("multer");
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/artists/");
    },
    filename: (req, file, cb) => {
        cb(null, "artist-" + Date.now() + "-" + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Definir rutas
router.get("/prueba", ArtistController.prueba);
router.post("/save", auth, ArtistController.save);
router.get("/one/:id", auth, ArtistController.one);
router.get("/list/:page?", auth, ArtistController.list);
router.put("/update/:id", auth, ArtistController.update);
router.delete("/remove/:id", auth, ArtistController.remove);
router.post("/upload/:id", [auth, upload.single("file0")], ArtistController.upload);
router.get("/image/:file", ArtistController.image);

// Exportar router
module.exports = router;