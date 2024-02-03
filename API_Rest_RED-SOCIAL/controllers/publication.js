const publication = require("../models/publication");

// Acciones de prueba
const pruebPublication = (req, res) => {
    return res.status(200).send({
        mensaje: "Mensaje enviado desde: Controllers/publication.js"
    });
}

// Guardar publicación

// Sacar una publicación

// Eliminar publicaciones

// Listar todas las publicaciones

// Listar publicaciones de un usuario

// Subir ficheros

// Devolver archivos multimedia imagenes


// Exportar acciones
module.exports = {
    pruebPublication
}