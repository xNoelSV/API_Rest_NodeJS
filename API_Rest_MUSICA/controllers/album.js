// Importaciones 
const Album = require("../models/album");
const Song = require("../models/song");
const fs = require("fs");
const path = require("path");

// Acciones de prueba
const prueba = (req, res) => {
    return res.status(200).send({ status: "success", message: "Mensaje eviado desde controllers/album.js" });
}

// Crear album
const save = (req, res) => {
    // Sacar datos del body
    let params = req.body;

    // Crear el objeto a guardar
    let album = new Album(params);

    // Guardar el objeto en la base de datos
    album
        .save()
        .then((albumStored) => {
            // Error en el guardado
            if (!albumStored) return res.status(400).send({ status: "error", sysMessage: error.toString() });

            // Guardado correcto
            return res.status(200).send({ status: "success", message: "Album guardado", album: albumStored });
        })
        .catch((error) => {
            return res.status(400).send({ status: "error", sysMessage: error.toString() });
        });
}

// Sacar un solo album
const one = (req, res) => {
    // Scar el id del album
    const albumId = req.params.id;

    // Find y popular info del artista
    Album
        .findById(albumId)
        .populate('artist')
        .then((album) => {
            // Error en la búsqueda
            if (!album) return res.status(404).send({ status: "error", message: "Album no encontrado" });

            // Búsqueda correcta
            return res.status(200).send({ status: "success", album });
        })
        .catch((error) => {
            console.log(error);
            return res.status(400).send({ status: "error", sysMessage: error.toString() });
        });
}

// Sacar todos los albums de un artista
const list = async (req, res) => {
    // Sacar el id del artista de la URL
    const artistId = req.params.artistId;

    // Sacar todos los albums de la base de datos de un artista en concreto
    if (!artistId) {
        // No se ha pasado el id del artista
        return res.status(400).send({ status: "error", message: "No se ha pasado el id del artista" });
    }

    await Album
        .find({ artist: artistId })
        .populate('artist') // Popular info del artista
        .then((albums) => {
            // Error en la búsqueda
            if (!albums) return res.status(404).send({ status: "error", message: "No hay albums" });

            // Búsqueda correcta
            return res.status(200).send({ status: "success", albums });
        })
        .catch((error) => {
            return res.status(400).send({ status: "error", sysMessage: error.toString() });
        });
}

// Actualizar album
const update = (req, res) => {
    // Recoger parámetros de la URL
    const albumId = req.params.albumId;

    // Recoger datos del body
    const data = req.body;

    // Find and update
    Album
        .findByIdAndUpdate(albumId, data, { new: true })
        .then((albumUpdated) => {
            // Error en la búsqueda
            if (!albumUpdated) return res.status(404).send({ status: "error", message: "Album no encontrado" });

            // Búsqueda correcta
            return res.status(200).send({ status: "success", album: albumUpdated });
        })
        .catch((error) => {
            return res.status(400).send({ status: "error", sysMessage: error.toString() });
        });
}

// Subir imagen de perfil 
const upload = (req, res) => {
    // Configuración de subida (multer)

    // Recoger artist id
    let albumId = req.params.id;

    // Recoger fichero de imagen y comprobar si existe
    if (!req.file) return res.status(404).send({ status: "error", message: "La petición no incluye la imagen" });

    // Conseguir el nombre del archivo
    let image = req.file.originalname;

    // Sacar info de la imagen
    const imageSplit = image.split("\.");
    const extension = imageSplit[1];

    // Comprobar si la extensión es válida
    if (extension != "png" && extension != "jpg" && extension != "jpeg" && extension != "gif") {
        // Borrar archivo
        const filePath = req.file.path;
        const fileDeleted = fs.unlinkSync(filePath);

        // Devolver respuesta
        return res.status(400).send({ status: "error", message: "Extensión no válida" });
    }

    // Si es correcto, gardar la imagen en la base de datos
    Album
        .findOneAndUpdate({ id: albumId }, { image: image }, { new: true })
        .then((albumUpdated) => {
            if (!albumUpdated) return res.status(400).send({ status: "error", message: "Error al guardar la imagen" });

            // Devolver respuesta
            return res.status(200).send({ status: "success", message: "Imagen subida", albumUpdated });
        })
        .catch((error) => {
            return res.status(400).send({ status: "error", sysMessage: error.toString() });
        });
}

// Mostrar imagen
const image = (req, res) => {
    // Sacar el parametro de la url
    const file = req.params.file;

    // Mostar el path real de la imagen
    const filePath = "./uploads/albums/" + file;

    // Comprobar que existe el fichero
    fs.stat(filePath, (error) => {
        if (error) return res.status(404).send({ status: "error", message: "La imagen no existe" });

        // Devolver el fichero tal cual
        return res.sendFile(path.resolve(filePath));
    });
}

// Elimiar un album
const remove = (req, res) => {
    // Sacar el id del album
    const albumId = req.params.albumId;

    try {
        // Eliminar el album
        const albumRemoved = Album.findByIdAndDelete(albumId).exec();

        // Eliminar todas las canciones del album
        const songRemoved = Song.deleteMany({ album: albumId }).exec();

        return res.status(200).send({ status: "success", message: "Album eliminado" });
    } catch (error) {
        return res.status(400).send({ status: "error", sysMessage: error.toString() });
    }
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
    upload,
    image,
    remove
}