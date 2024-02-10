// Importar módulos
const jwt = require("jwt-simple");
const moment = require("moment");

// Importar clave secreta
const { secret } = require("../helpers/jwt");

// Crear middleware (método o funcion)
exports.auth = (req, res, next) => {
    // Comprobar si me llega la cabecera de autorización
    if (!req.headers.authorization) {
        return res.status(403).send({ status: "error", message: "Falta la cabecera de autorización" });
    }

    // Limpiar el token
    let token = req.headers.authorization.replace(/['"]+/g, "");

    // Decodificar el token
    try {
        let payload = jwt.decode(token, secret);

        // Comprobar si el token ha expirado
        if (payload.exp <= moment().unix()) {
            return res.status(404).send({ status: "error", message: "Token ha expirado" });
        }

        // Agregar datos del usuario a la request
        req.user = payload;
    } catch (error) {
        return res.status(404).send({ status: "error", message: "Token no válido", sysMessage: error.toString() });
    }

    // Pasar a la ejecución de la acción
    next();
}
