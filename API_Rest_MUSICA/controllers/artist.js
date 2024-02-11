// Importaciones
const Artist = require("../models/artist");
const Album = require("../models/album");
const Song = require("../models/song");
const fs = require("fs");
const path = require("path");

// Acciones de prueba
const prueba = (req, res) => {
    return res.status(200).send({ status: "success", message: "Mensaje eviado desde controllers/artist.js" });
}

// Acción guardar artista
const save = (req, res) => {
    // Recoger datos del body
    let params = req.body;

    // Crear el objeto a guardar
    let artist = new Artist(params);

    // Guardar el objeto en la base de datos
    artist
        .save()
        .then((artistStored) => {
            // Error en el guardado
            if (!artistStored) return res.status(400).send({ status: "error", sysMessage: error.toString() });

            // Guardado correcto
            return res.status(200).send({ status: "success", message: "Artista guardado", artist: artistStored });
        })
        .catch((error) => {
            return res.status(400).send({ status: "error", sysMessage: error.toString() });
        });
}

// Devolver un solo artista
const one = (req, res) => {
    // Sacar un parámetro por la URL
    const artistId = req.params.id;

    // Find
    Artist
        .findById(artistId)
        .then((artist) => {
            // Error en la búsqueda
            if (!artist) return res.status(404).send({ status: "error", message: "Artista no encontrado" });

            // Búsqueda correcta
            return res.status(200).send({ status: "success", artist });
        })
        .catch((error) => {
            return res.status(400).send({ status: "error", sysMessage: error.toString() });
        });
}

// Sacar todos los artistas
const list = (req, res) => {
    // Sacar la posible pagina
    let page = 1;
    if (req.params.page) page = req.params.page;

    // Definir numero de elementos por page
    const itemsPerPage = 5;

    // Final, ordenarlo y paginarlo
    Artist
        .paginate(
            {},
            { page: page, limit: itemsPerPage }
        )
        .then((artists) => {
            // Error en la búsqueda
            if (!artists) return res.status(404).send({ status: "error", message: "No hay artistas" });

            // Búsqueda correcta
            return res.status(200).send({ status: "success", artists });
        })
        .catch((error) => {
            return res.status(400).send({ status: "error", sysMessage: error.toString() });
        });
}

// Modificar artista
const update = (req, res) => {
    // Recoger id artista por la URL
    const id = req.params.id;

    // Recoger datos del body
    const data = req.body;

    // Buscar y actualizar artista
    Artist
        .findByIdAndUpdate(id, data, { new: true })
        .then((artistUpdated) => {
            // Error en la actualización
            if (!artistUpdated) return res.status(404).send({ status: "error", message: "Artista no encontrado" });

            // Actualización correcta
            return res.status(200).send({ status: "success", artist: artistUpdated });
        })
        .catch((error) => {
            return res.status(400).send({ status: "error", sysMessage: error.toString() });
        });
}

// Elimiar artista
const remove = async (req, res) => {
    // Sacar el id del artista de la URL
    const artistId = req.params.id;

    try {
        // Hacer consulta para buscar y eliminar el artista con un await
        const artistRemoved = await Artist.findByIdAndDelete(artistId);
        const albumsRemoved = await Album.find({ artist: artistRemoved._id });
        albumsRemoved.forEach(async (album) => {
            // Remove de songs
            const songsRemoved = await Song.deleteMany({ album: { $in: album._id } }); // Remove de canciones
        });
        const albumsFinallyRemoved = await Album.deleteMany({ artist: artistRemoved._id });

        // Devolver respuesta
        return res.status(200).send({ status: "success", message: "Método de eliminado", artistRemoved});

    } catch (error) {
        return res.status(400).send({ status: "error", sysMessage: error.toString() });
    }
}

// Subir imagen de perfil 
const upload = (req, res) => {
    // Configuración de subida (multer)

    // Recoger artist id
    let artistId = req.params.id;

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
    Artist
        .findOneAndUpdate({ _id: artistId }, { image: image }, { new: true })
        .then((artistUpdated) => {
            if (!artistUpdated) return res.status(400).send({ status: "error", message: "Error al guardar la imagen" });

            // Devolver respuesta
            return res.status(200).send({ status: "success", message: "Imagen subida", artistUpdated });
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
    const filePath = "./uploads/artists/" + file;

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
    image
}