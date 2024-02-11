// Importar dependencias
const express = require("express");

// Cargar router
const router = express.Router();

// Importar controlador
const SongController = require("../controllers/song");

// Importar middleware
const { auth } = require("../middlewares/auth");

// Configuración de subida
const multer = require("multer");
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/songs/");
    },
    filename: (req, file, cb) => {
        cb(null, "song-" + Date.now() + "-" + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Definir rutas
router.get("/prueba", SongController.prueba);
router.post("/save", auth, SongController.save);
router.get("/one/:id", auth, SongController.one);
router.get("/list/:albumId", auth, SongController.list);
router.put("/update/:id", auth, SongController.update);
router.delete("/remove/:id", auth, SongController.remove);
router.post("/upload/:id", [auth, upload.single("file0")], SongController.upload);
router.get("/audio/:file", SongController.audio);

// Exportar router
module.exports = router;