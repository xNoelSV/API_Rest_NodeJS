// Importar dependencias y modulos
const bcrypt = require("bcrypt");
const mongoosePagination = require("mongoose-pagination");
const fs = require("fs");
const path = require("path");

// Importar modelos
const User = require("../models/user");
const Follow = require("../models/follow");
const Publications = require("../models/publication");

// Importar servicios
const jwt = require("../services/jwt");
const followService = require("../services/followService");
const validate = require("../helpers/validate");

// Acciones de prueba
const pruebaUser = (req, res) => {
    return res.status(200).send({
        mensaje: "Mensaje enviado desde: Controllers/user.js",
        user: req.user
    });
}

// Registro
const register = (req, res) => {

    // Recoger datos de la petición
    let params = req.body;

    // Comprobar que me llegan los datos bien (+ validación)
    if (!params.name || !params.email || !params.password || !params.nick) {
        return res.status(400).json({
            status: "error",
            message: "Faltan datos por enviar"
        });
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
            if (users && users.length >= 1) return res.status(200).json({ status: "success", message: "El usuario ya existe" });

            // Cifrar la contraseña
            /*bcrypt.hash(user_to_save.password, 10, (error, pwd) => {
                user_to_save.password = pwd;
                console.log(user_to_save);
            })*/
            let pwd = await bcrypt.hash(params.password, 10);
            params.password = pwd;

            // Crear objeto de usuario
            let user_to_save = new User(params);

            // Guardar usuario en la base de datos
            const userStored = user_to_save.save();
            if (!userStored) return res.status(500).json({ status: "error", message: "Error al guardar el usuario" });

            // Devolver el resultado    
            return res.status(200).json({
                status: "success",
                message: "Usuario registrado correctamente",
                user: userStored
            });
        })
        .catch((error) => {
            return res.status(500).json({ status: "error", menssage: "error en la consulta de usuarios" });
        })
}

// Login
const login = (req, res) => {

    // Recoger parámetros body
    let params = req.body;
    if (!params.email || !params.password) return res.status(400).send({ status: "error", message: "faltan datos por enviar" });

    // Buscar en la base de datos si existe el usuario
    User
        .findOne({ email: params.email })
        //.select({ "password": 0 }) Select para eliminar contraseña de la consulta
        .exec()
        .then((user) => {
            if (!user) return res.status(404).send({ status: "error", message: "No existe el usuario" });

            // Comprobar contraseña
            let pwd = bcrypt.compareSync(params.password, user.password)
            if (!pwd) return res.status(400).send({ status: "error", message: "No te has identificado correctamente" })

            // Devolver token
            const token = jwt.createToken(user);

            // Datos datos del usuario
            return res.status(200).json({
                status: "success",
                message: "Te has identificado correctamente",
                user: { // Eliminar password del objeto
                    id: user._id,
                    name: user.name,
                    nick: user.nick
                },
                token
            });
        })
        .catch((error) => {
            return res.status(404).send({ status: "error", message: "No existe el usuario", sysMessage: error.toString() });
        });
}

// Perfil
const profile = (req, res) => {
    // Recibir el parámetro del ID del usuario por la URL
    const id = req.params.id;

    // Consulta para sacar los datos del usuario
    User
        .findById(id)
        .select({ password: 0, role: 0 })
        .exec()
        .then(async (userProfile) => {

            // Comprueba si existe el usuario
            if (!userProfile) return res.status(404).send({ status: "error", message: "Usuario no existente" })

            // Info de seguimiento (late)
            const followInfo = await followService.followThisUser(req.user.id, id)

            // Devolver el resultado
            return res.status(200).send({
                status: "success",
                user: userProfile,
                following: followInfo.following,
                follower: followInfo.follower
            });

        })
        .catch((error) => {
            return res.status(500).send({ status: "error", message: "Error en la consulta", sysMessage: error.toString() })
        })
}

// Página listado de usuarios
const list = async (req, res) => {
    // Controlar en que página estamos
    let page = 1;
    if (req.params.page) page = req.params.page;
    page = parseInt(page);

    // Consulta con mongoose pagination
    let itemsPerPage = 5;
    let total = await User.countDocuments({}).exec();
    User
        .find()
        .select("-password -email -role -__v")
        .sort("_id")
        .paginate(page,  )
        .then(async (users) => {
            if (!users) return res.status(404).send({ status: "error", message: "No hay usuarios disponibles" });

            // Sacar un array de ids de los usuarios que me siguen y sigo como "x"
            let followUserIds = await followService.followUserIds(req.user.id);

            // Devolver resultado (posteriormente info de follows)
            return res.status(200).send({
                status: "success",
                users,
                itemsPerPage,
                totalItems: total,
                page,
                pages: Math.ceil(total / itemsPerPage),
                user_following: followUserIds.following,
                user_follow_me: followUserIds.followers
            });
        })
        .catch((error) => {
            return res.status(500).send({ status: "error", message: "Error en la consulta", sysMessage: error.toString() })
        })
}

// Actualizar perfil de usuario
const update = (req, res) => {
    // Recoger info del usuario a actualizar
    let userIdentity = req.user;
    let userToUpdate = req.body;

    // Eliminar campos sobrantes
    delete userToUpdate.iat;
    delete userToUpdate.exp;
    delete userToUpdate.role;
    delete userToUpdate.image;

    // Control de usuarios duplicados
    User
        .find({
            $or: [
                { email: userToUpdate.email.toLowerCase() },
                { nick: userToUpdate.nick.toLowerCase() }
            ]
        })
        .then(async (users) => {
            // Comprobar que el usuario del token ya existe en la base de datos
            let userIsset = false;
            users.forEach(user => {
                if (user && user._id != userIdentity._id) userIsset = true;
            });
            if (userIsset) return res.status(200).json({ status: "success", message: "El usuario ya existe" });

            // Cifrar la contraseña (Si me llega)
            if (userToUpdate.password) {
                let pwd = await bcrypt.hash(userToUpdate.password, 10);
                userToUpdate.password = pwd;
            } else {
                delete userToUpdate.password;
            }

            // Buscar y actualizar
            User
                .findByIdAndUpdate({ _id: userIdentity.id }, userToUpdate, { new: true })
                .select({ password: 0 })
                .exec()
                .then((userUpdated) => {
                    if (!userToUpdate) return res.status(400).send({ status: "error", sysMessage: error.toString() });

                    return res.status(200).send({ status: "success", user: userUpdated });
                })
                .catch((error) => {
                    return res.status(400).send({ status: "error", sysMessage: error.toString() });
                })
        });

}

// Subir archivos
const upload = (req, res) => {
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
    User
        .findByIdAndUpdate({ _id: req.user.id }, { image: req.file.filename }, { new: true })
        .then((userUpdated) => {
            if (!userUpdated) return res.status(500).send({ status: "error", sysMessage: error.toString() });

            // Devolver respuesta
            return res.status(200).send({ status: "success", user: userUpdated, file: req.file });
        })
        .catch((error) => {
            return res.status(500).send({ status: "error", sysMessage: error.toString() });
        });
}

// Sacar avatar
const avatar = (req, res) => {
    // Sacar el parametro de la URL
    const file = req.params.file;

    // Montar el path real de la imagen
    const filePath = "./uploads/avatars/" + file;

    // Comprobar que existe
    fs.stat(filePath, (error, exists) => {
        if (!exists) return res.status(404).send({ status: "error", message: "No existe la imagen" });

        // Devolver un file
        return res.sendFile(path.resolve(filePath));
    });
}

// Sacar seguidores
const counters = async (req, res) => {
    // Sacamos el usuario del que queremos contar los seguidores. Por defecto: Nosotros.
    let userId = req.user.id;
    if (req.params.id) userId = req.params.id;

    // Sacamos el numero de seguidores, seguidos y publicaciones del usuario que estamos consultando.
    try {
        const following = await Follow.count({ "user": userId });
        const followed = await Follow.count({ "followed": userId });
        const publications = await Publications.count({ "user": userId });

        return res.status(200).send({ userId, following: following, followed: followed, publications: publications});
    } catch (error) {
        return res.status(500).send({ status: "error", sysMessage: error.toString() });
    }
}

// Exportar acciones
module.exports = {
    pruebaUser,
    register,
    login,
    profile,
    list,
    update,
    upload,
    avatar,
    counters
}