// Importar dependencias y módulos
const User = require("../models/user");
const bcrypt = require("bcrypt");

// Acciones de prueba
const pruebaUser = (req, res) => {
    return res.status(200).send({
        mensaje: "Mensaje enviado desde: Controllers/user.js"
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

// Exportar acciones
module.exports = {
    pruebaUser,
    register
}