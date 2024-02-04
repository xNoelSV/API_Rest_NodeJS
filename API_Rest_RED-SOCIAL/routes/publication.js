const express = require("express");
const router = express.Router();
const multer = require("multer");
const PublicationController = require("../controllers/publication");
const { auth } = require("../middelwares/auth");

// Configuración de subida
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/publications/");
    },
    filename: (req, file, cb) => {
        cb(null, "pub-"+Date.now()+"-"+file.originalname);
    }
});
const uploads = multer({storage});

// Definir rutas
router.get("/prueba-publication", PublicationController.pruebaPublication);
router.post("/save", auth, PublicationController.save);
router.get("/detail/:id", auth, PublicationController.detail);
router.delete("/remove/:id", auth, PublicationController.remove);
router.get("/user/:id/:page?", auth, PublicationController.user);
router.post("/upload/:id", [auth, uploads.single("file0")], PublicationController.upload);
router.get("/media/:file", auth, PublicationController.media);

// Exportar router
module.exports = router;