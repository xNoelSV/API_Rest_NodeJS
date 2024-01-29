// Importar dependencias y modulos
const bcrypt = require("bcrypt");
const mongoosePagination = require("mongoose-pagination");

// Importar modelos
const User = require("../models/user");

// Importar servicios
const jwt = require("../services/jwt")

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
        .then((userProfile) => {

            // Comprueba si existe el usuario
            if (!userProfile) return res.status(404).send({ status: "error", message: "Usuario no existente" })

            // Devolver el resultado
            return res.status(200).send({ status: "success", user: userProfile })

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
        .sort("_id")
        .paginate(page, itemsPerPage)
        .then((users) => {
            if (!users) return res.status(404).send({ status: "error", message: "No hay usuarios disponibles" });

            // Devolver resultado (posteriormente info de follows)
            return res.status(200).send({ status: "success", users, itemsPerPage, totalItems: total, page, pages: Math.ceil(total/itemsPerPage) })
        })
        .catch((error) => {
            return res.status(500).send({ status: "error", message: "Error en la consulta", sysMessage: error.toString() })
        })
}

// Exportar acciones
module.exports = {
    pruebaUser,
    register,
    login,
    profile,
    list
}