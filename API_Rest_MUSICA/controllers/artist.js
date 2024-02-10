// Importaciones
const Artist = require("../models/artist");

// Acciones de prueba
const prueba = (req, res) => {
    return res.status(200).send({ status: "success", message: "Mensaje eviado desde controllers/artist.js" });
}

// Acción guardar artista
const save = (req, res) => {
    return res.status(200).send({ status: "success", message: "Mensaje de acción guardar artista" });
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
    save
}