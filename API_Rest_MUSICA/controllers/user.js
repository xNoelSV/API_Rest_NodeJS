// Importaciones
const bcrypt = require("bcrypt");
const validate = require("../helpers/validate");
const fs = require("fs");
const path = require("path");
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
            return res.status(200).send({ status: "success", message: "Método login", identityUser, token: token });
        })
        .catch((error) => {
            return res.status(400).send({ status: "error", sysMessage: error.toString() });
        });
}

// Perfil de usuario
const profile = (req, res) => {
    // Recoger id usuario url
    const id = req.params.id;

    // Consultar usuario para sacar los datos del perfil
    User
        .findById(id)
        .then((user) => {
            // Si no existe el usuario
            if (!user) return res.status(404).send({ status: "error", message: "El usuario no existe" });

            // Devolver respuesta
            return res.status(200).send({ status: "success", user });
        })
        .catch((error) => {
            return res.status(400).send({ status: "error", sysMessage: error.toString() });
        });
}

// Editar perfil de usuario
const update = (req, res) => {
    // Recoger datos del usuario identificado
    let userIdentity = req.user;

    // Recoger datos a actualizar
    let userToUpdate = req.body;

    // Validación avanzada
    try {
        validate(userToUpdate);
    } catch (error) {
        return res.status(400).send({ status: "error", message: "Validación no superada" });
    }

    // Comprobar si el usuario existe
    User
        .find({
            $or: [
                { email: userToUpdate.email.toLowerCase() },
                { nick: userToUpdate.nick.toLowerCase() }
            ]
        })
        .then(async (users) => {
            // Comprobar si usuario existe y no soy yo (el usuario identificado)
            let user_isset = false;
            users.forEach((user) => {
                if (user && user._id != userIdentity.id) user_isset = true;
            });

            // Si ya existe, devolver una respuesta
            if (user_isset) {
                return res.status(200).send({ status: "success", message: "El usuario ya existe" });
            }

            // Cifrar password si me llegara
            if (userToUpdate.password) {
                let pwd = await bcrypt.hash(userToUpdate.password, 10);
                userToUpdate.password = pwd;
            } else {
                delete userToUpdate.password;
            }

            try {
                // Buscar usuario en la bd y actualizarlo
                let userUpdated = await User
                    .findByIdAndUpdate({ _id: userIdentity.id }, userToUpdate, { new: true })
                if (!userUpdated) return res.status(400).send({ status: "error", sysMessage: "Error al actualizar" });

                // Devolver respuesta
                return res.status(200).send({ status: "success", userUpdated });
            } catch (error) {
                return res.status(500).send({ status: "error", sysMessage: "Error al actualizar" });
            }

        })
        .catch((error) => {
            return res.status(500).send({ status: "error", sysMessage: error.toString() });
        });
}

// Subir imagen de perfil 
const upload = (req, res) => {
    // Configuración de subida (multer)

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
    User
        .findOneAndUpdate({ _id: req.user.id }, { image: image }, { new: true })
        .then((userUpdated) => {
            if (!userUpdated) return res.status(400).send({ status: "error", message: "Error al guardar la imagen" });

            // Devolver respuesta
            return res.status(200).send({ status: "success", message: "Imagen subida", userUpdated });
        })

    // Devolver respuesta
    return res.status(200).send({ status: "success", message: "Método upload", file: req.file });

}

// Mostrar imagen
const avatar = (req, res) => {
    // Sacar el parametro de la url
    const file = req.params.file;

    // Mostar el path real de la imagen
    const filePath = "./uploads/avatars/" + file;

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
    return res.status(400).send({ status: "error", sysMessage: error.toString() });
    if (error) return res.status(400).send({ status: "error", sysMessage: error.toString() });
 */

// exportar acciones
module.exports = {
    prueba,
    register,
    login,
    profile,
    update,
    upload,
    avatar
}