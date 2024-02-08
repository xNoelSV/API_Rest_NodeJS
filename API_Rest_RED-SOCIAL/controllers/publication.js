// Importar módulos
const fs = require("fs");
const path = require("path");

// Importar modelos
const Publication = require("../models/publication");

// Importar servicios
const FollowService = require("../services/followService");

// Acciones de prueba
const pruebaPublication = (req, res) => {
    return res.status(200).send({
        mensaje: "Mensaje enviado desde: Controllers/publication.js"
    });
}

// Guardar publicación
const save = (req, res) => {
    // Recoger datos del body
    const params = req.body;

    // Si no me llegan, dar respuesta negativa
    if (!params.text) return res.status(400).send({ status: "error", message: "Debes enviar el texto de la publicación" });

    // Crear y rellenar el objeto del modelo
    let newPublication = new Publication(params);
    newPublication.user = req.user.id;

    // Guardar objeto en la base de datos
    newPublication
        .save()
        .then((publicationStored) => {
            if (!publicationStored) return res.status(404).send({ status: "error", message: "No se ha guardado el objeto correctamente" });

            // Devolver respuesta
            return res.status(200).send({ status: "success", message: "Publicación guardada", publicationStored });
        })
        .catch((error) => {
            if (error) return res.status(400).send({ status: "error", sysMessage: error.toString() });
        });
}

// Sacar una publicación
const detail = (req, res) => {
    // Sacar id de publicacion de la url
    const publicationId = req.params.id;

    // Find con la condicion del id
    Publication
        .findById(publicationId)
        .then((publicationStored) => {
            if (!publicationStored) return res.status(404).send({ status: "error", message: "No se ha guardado el objeto correctamente" });

            // Devolver respuesta
            return res.status(200).send({ status: "success", publicationStored });
        })
        .catch((error) => {
            if (error) return res.status(400).send({ status: "error", sysMessage: error.toString() });
        })
}

// Eliminar publicaciones
const remove = (req, res) => {
    // Sacar el id del publication a eliminar
    const params = req.params;

    // Find y luego remove de una publicación hecha por el usuario
    Publication
        .findOneAndDelete({ "user": req.user.id, "_id": params.id })
        .exec()
        .then((result) => {
            if (!result) return res.status(404).send({ status: "error", sysMessage: "No se ha podido borrar la publicación" });

            // Devolver respuesta
            return res.status(200).send({ status: "success", message: "Publicación eliminada" });
        })
        .catch((error) => {
            if (error) return res.status(400).send({ status: "error", sysMessage: error.toString() });
        });
}

// Listar publicaciones de un usuario
const user = (req, res) => {
    // Sacar el id de usuario
    const userId = req.params.id;

    // Controlar la pagina
    let page = 1;
    if (req.params.page) page = req.params.page;

    // Controlar las publicaciones
    let itemsPerPage = 5

    // Find, populate, ordenar, paginar
    Publication
        .paginate(
            { user: userId },
            {
                page: page,
                limit: itemsPerPage,
                populate: { path: "user", select: "-password -role -email -__v -iat -env" },
                sort: "created_at"
            })
        .then((publicationStored) => {
            if (publicationStored.totalDocs == 0) return res.status(404).send({ status: "error", message: "No se han recuperado publicaciones" });

            // Devolver respuesta
            return res.status(200).send({ status: "success", publications: publicationStored });
        })
        .catch((error) => {
            return res.status(400).send({ status: "error", sysMessage: error.toString() })
        });
}

// Subir ficheros
const upload = (req, res) => {
    // Sacar publication ID
    const publicationId = req.params.id;

    // Recoger el fichero de imagen y comprobar que existe
    if (!req.file) {
        return res.status(404).send({
            status: "error",
            message: "Petición no incluye imagen"
        });
    }

    // Conseguir el nombre del archivo
    let image = req.file.originalname;

    // Sacar la extension del archivo
    const imageSplit = image.split("\.");
    const extension = imageSplit[1];

    // Comprobar extension
    if (extension != "png" && extension != "jpg" && extension != "jpeg" && extension != "gif") {

        // Borrar archivo subido
        const filePath = req.file.path;
        const fileDeleted = fs.unlinkSync(filePath);

        // Devolver respuesta negativa
        return res.status(400).send({ status: "error", message: "Extensión del fichero invalida" });
    }

    // Si es correcta, guardar imagen en la base de datos
    Publication
        .findByIdAndUpdate({ "user": req.user.id, "_id": publicationId }, { file: req.file.filename }, { new: true })
        .then((publicationUpdated) => {
            if (!publicationUpdated) return res.status(500).send({ status: "error", message: "Error al subir la imagen" });

            // Devolver respuesta
            return res.status(200).send({ status: "success", user: publicationUpdated, file: req.file });
        })
        .catch((error) => {
            return res.status(500).send({ status: "error", sysMessage: error.toString() });
        });
}

// Devolver archivos multimedia imagenes
const media = (req, res) => {
    // Sacar el parametro de la URL
    const file = req.params.file;

    // Montar el path real de la imagen
    const filePath = "./uploads/publications/" + file;

    // Comprobar que existe
    fs.stat(filePath, (error, exists) => {
        if (!exists) return res.status(404).send({ status: "error", message: "No existe la imagen" });

        // Devolver un file
        return res.sendFile(path.resolve(filePath));
    });
}

// Listar todas las publicaciones (FEED)
const feed = async (req, res) => {
    // Sacar la página actual
    let page = 1;
    if (req.params.page) page = req.params.page;

    // Establecer número de de elementos por página
    let itemsPerPage = 5;

    // Sacar un array de identificadores de usuarios que yo sigo como usuario identificado
    try {
        const myFollows = await FollowService.followUserIds(req.user.id);

        // Find a publicaciones utilizando operador "in". Ordenar, popular y paginar
        Publication
            .paginate(
                { user: myFollows.following }, 
                { page: page, limit: itemsPerPage, populate: {path: "user", select: "-password -role -__v -email", sort: "-created_at"} })
            .then((publicacions) => {
                // Devolver respuesta
                return res.status(200).send({ status: "success", message: "Ruta en pruebas", following: myFollows.following, publicacions });

            })
            .catch((error) => {
                return res.status(400).send({ status: "error", sysMessage: error.toString() });
            });
    } catch (error) {
        return res.status(500).send({ status: "error", sysMessage: error.toString() });
    }
}

/**
 * respuesta defecto:
 * // Devolver respuesta
    return res.status(200).send({ status: "success", message: "Ruta en pruebas" });
 * error:
    if (error) return res.status(400).send({ status: "error", sysMessage: error.toString() });
 */

// Exportar acciones
module.exports = {
    pruebaPublication,
    save,
    detail,
    remove,
    user,
    upload,
    media,
    feed
}