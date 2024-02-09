// Acciones de prueba
const prueba = (req, res) => {
    return res.status(200).send({ status: "success", message: "Mensaje eviado desde controllers/user.js" });
}

// Registro 
const register = (req, res) => {
    // Recoger datos de la peticion
    let params = req.body;
    console.log(params);
    
    // Comprobar que me llegan bien


    // Validar los datos

    // Control de usuarios duplicados

    // Cifrar contraseña

    // Crear objeto del usuario

    // Guardar usuario en la base de datos

    // Limpiar el objeto a devolver

    // Devolver resultado


    return res.status(200).send({ status: "success", message: "Ruta en pruebas" });
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
    register
}