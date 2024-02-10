// Importaciones
const bcrypt = require("bcrypt");
const validate = require("../helpers/validate");
const User = require("../models/user");
const jwt = require("../helpers/jwt");

// Acciones de prueba
const prueba = (req, res) => {
    return res.status(200).send({ status: "success", message: "Mensaje eviado desde controllers/user.js" });
}

// Registro 
const register = (req, res) => {

    // Recoger datos de la petición
    let params = req.body;

    // Comprobar que me llegan los datos bien (+ validación)
    if (!params.name || !params.email || !params.password || !params.nick) {
        return res.status(400).json({ status: "error", message: "Faltan datos por enviar" });
    }

    // Validación avanzada
    try {
        validate(params);
    } catch (error) {
        return res.status(400).send({ status: "error", message: "Validación no superada" });
    }

    // Control de usuarios duplicados
    User
        .find({
            $or: [
                { email: params.email.toLowerCase() },
                { nick: params.nick.toLowerCase() }
            ]
        })
        .then(async (users) => {
            // Mensaje de error si el usuario ya existe
            if (users && users.length >= 1) {
                return res.status(200).send({ status: "error", message: "El usuario ya existe" });
            }

            // Cifrar contraseña
            let pwd = await bcrypt.hash(params.password, 10);
            params.password = pwd;

            // Crear objeto del usuario
            let userToSave = new User(params);

            // Guardar usuario en la base de datos
            userToSave
                .save()
                .then((user) => {
                    // Error en el guardado
                    if (!user) return res.status(400).send({ status: "error", message: "Error al guardar el usuario" });

                    // Limpiar el objeto
                    let userCreated = user.toObject();
                    delete userCreated.password;
                    delete userCreated.role;

                    // Devolver resultado
                    return res.status(200).send({ status: "success", message: "Usuario registrado", user: userCreated });
                })
                .catch((error) => {
                    return res.status(400).send({ status: "error", message: "Error al guardar el usuario" });
                });
        })
        .catch((error) => {
            return res.status(400).send({ status: "error", message: "Error en la consulta de control de usuarios duplicados" });
        });
}

// Login
const login = (req, res) => {
    // Recoger los parámetros de la petición
    let params = req.body;

    // Comprobar que me llegan 
    if (!params.email || !params.password) {
        return res.status(400).send({ status: "error", message: "Faltan datos por enviar" });
    }

    // Buscar en la bd si existe el email
    User
        .findOne({ email: params.email })
        .select("+password +role")
        .then((user) => {
            // Si no existe el usuario
            if (!user) return res.status(400).send({ status: "error", message: "El usuario no existe" });

            // Comprobar la contraseña
            const pwd = bcrypt.compareSync(params.password, user.password);
            if (!pwd) return res.status(400).send({ status: "error", message: "Login incorrecto" });

            // Conseguir token JWT (crear un servicio que nos permtia generar el token)
            const token = jwt.createToken(user);

            // Limpiar y devolver datos usuario y token
            let identityUser = user.toObject(); 
            delete identityUser.password;
            delete identityUser.role;
            return res.status(200).send({ status: "success", message: "Método login", identityUser, token: token});
        })
        .catch((error) => {
            return res.status(400).send({ status: "error", sysMessage: error.toString() });
        });
}

/**
 * respuesta defecto:
 * // Devolver respuesta
    return res.status(200).send({ status: "success", message: "Ruta en pruebas" });
 * error:
    return res.status(400).send({ status: "error", sysMessage: error.toString() });
    if (error) return res.status(400).send({ status: "error", sysMessage: error.toString() });
 */

// exportar acciones
module.exports = {
    prueba,
    register,
    login
}