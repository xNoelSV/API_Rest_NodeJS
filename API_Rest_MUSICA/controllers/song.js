// Importaciones
const Song = require("../models/song");
const fs = require("fs");
const path = require("path");

// Acciones de prueba
const prueba = (req, res) => {
    return res.status(200).send({ status: "success", message: "Mensaje eviado desde controllers/song.js" });
}

// Guardar canción
const save = (req, res) => {
    // Recoger datos del body
    let params = req.body;

    // Crear el objeto a guardar
    let song = new Song(params);

    // Guardar el objeto en la base de datos
    song
        .save()
        .then((songStored) => {
            // Error en el guardado
            if (!songStored) return res.status(400).send({ status: "error", sysMessage: error.toString() });

            // Guardado correcto
            return res.status(200).send({ status: "success", message: "Canción guardada", song: songStored });
        })
        .catch((error) => {
            return res.status(400).send({ status: "error", sysMessage: error.toString() });
        });
}

// Mostar una canción
const one = (req, res) => {
    // Sacar un parámetro por la URL
    const songId = req.params.id;

    // Find
    Song
        .findById(songId)
        .populate('album')
        .then((song) => {
            // Error en la búsqueda
            if (!song) return res.status(404).send({ status: "error", message: "Canción no encontrada" });

            // Búsqueda correcta
            return res.status(200).send({ status: "success", song });
        })
        .catch((error) => {
            return res.status(400).send({ status: "error", sysMessage: error.toString() });
        });
}

// Mostar todas las canciones de un album
const list = (req, res) => {
    // Recoger el id del album de la URL
    let albumId = req.params.albumId;

    // Hacer consulta
    Song
        .find({ album: albumId })
        .sort("track")
        .populate({
            path: "album",
            populate: {
                path: "artist",
                model: "Artist"
            }
        })
        .then((songs) => {
            // Error en la búsqueda
            if (!songs) return res.status(404).send({ status: "error", message: "No hay canciones" });

            // Búsqueda correcta
            return res.status(200).send({ status: "success", songs });
        })
        .catch((error) => {
            return res.status(400).send({ status: "error", sysMessage: error.toString() });
        });
}

// Actualizar canción
const update = (req, res) => {
    // Parametro URL ID de la canción
    let songId = req.params.id;

    // Datos para guardar
    let data = req.body;

    // Buscar y actualizar documento de la base de datos
    Song
        .findByIdAndUpdate(songId, data, { new: true })
        .then((songUpdated) => {
            // Error en la actualización
            if (!songUpdated) return res.status(404).send({ status: "error", message: "Canción no encontrada" });

            // Búsqueda correcta
            return res.status(200).send({ status: "success", message: "Canción actualizada", song: songUpdated });
        })
        .catch((error) => {
            return res.status(400).send({ status: "error", sysMessage: error.toString() });
        });
}

// Borar canción
const remove = (req, res) => {
    // Recolectar ID de la canción
    const songId = req.params.id;

    // Buscar y eliminar canción
    Song
        .findByIdAndDelete(songId)
        .then((songRemoved) => {
            // Error en la eliminación
            if (!songRemoved) return res.status(404).send({ status: "error", message: "Canción no encontrada" });

            // Eliminación correcta
            return res.status(200).send({ status: "success", message: "Canción eliminada", song: songRemoved });
        })
        .catch((error) => {
            return res.status(400).send({ status: "error", sysMessage: error.toString() });
        });
}

// Subir imagen de perfil 
const upload = (req, res) => {
    // Configuración de subida (multer)

    // Recoger artist id
    let songId = req.params.id;

    // Recoger fichero de imagen y comprobar si existe
    if (!req.file) return res.status(404).send({ status: "error", message: "La petición no incluye la imagen" });

    // Conseguir el nombre del archivo
    let image = req.file.originalname;

    // Sacar info de la imagen
    const imageSplit = image.split("\.");
    const extension = imageSplit[1];

    // Comprobar si la extensión es válida
    if (extension != "mp3" && extension != "ogg") {
        // Borrar archivo
        const filePath = req.file.path;
        const fileDeleted = fs.unlinkSync(filePath);

        // Devolver respuesta
        return res.status(400).send({ status: "error", message: "Extensión no válida" });
    }

    // Si es correcto, gardar la imagen en la base de datos
    Song
        .findOneAndUpdate({ _id: songId }, { file: image }, { new: true })
        .then((songUpdated) => {
            if (!songUpdated) return res.status(400).send({ status: "error", message: "Error al guardar la imagen" });

            // Devolver respuesta
            return res.status(200).send({ status: "success", message: "Imagen subida", songUpdated });
        })
        .catch((error) => {
            return res.status(400).send({ status: "error", sysMessage: error.toString() });
        });
}

// Mostrar imagen
const audio = (req, res) => {
    // Sacar el parametro de la url
    const file = req.params.file;

    // Mostar el path real de la imagen
    const filePath = "./uploads/songs/" + file;

    // Comprobar que existe el fichero
    fs.stat(filePath, (error) => {
        if (error) return res.status(404).send({ status: "error", message: "La imagen no existe" });

        // Devolver el fichero tal cual
        return res.sendFile(path.resolve(filePath));
    });
}

/**
 * respuesta defecto:
 * // Devolver respuesta
    return res.status(200).send({ status: "success", message: "Ruta en pruebas" });
 * error:
    if (error) return res.status(400).send({ status: "error", sysMessage: error.toString() });
 */

// exportar acciones
module.exports = {
    prueba,
    save,
    one,
    list,
    update,
    remove,
    upload,
    audio
}