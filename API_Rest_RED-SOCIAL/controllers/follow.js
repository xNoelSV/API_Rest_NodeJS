// Importar modelo
const Follow = require("../models/follow");
const User = require("../models/user");

// Importar servicio
const followService = require("../services/followService");

// Acciones de prueba
const pruebaFollow = (req, res) => {
    return res.status(200).send({
        mensaje: "Mensaje enviado desde: Controllers/follow.js"
    });
}

// Acción de guardar un follow (acción seguir)
const save = (req, res) => {
    // Conseguir datos por body
    const params = req.body;

    // Sacar id del usuario identificado
    const identity = req.user;

    // Crear objeto con modelo follow
    let userToFollow = new Follow({
        user: identity.id,
        followed: params.followed
    });

    // Guardar objeto en la base de datos
    userToFollow
        .save()
        .then((followStored) => {
            if (!followStored) return res.status(404).send({ status: "error", message: "No se ha podido seguir al usuario" });

            // Devolver resultado
            return res.status(200).send({ status: "success", identity: req.user, follow: followStored });
        })
        .catch((error) => {
            return res.status(400).send({ status: "error", sysMessage: error.toString() })
        });
}

// Acción de borrar un follow (acción dejar de seguir)
const unfollow = (req, res) => {
    // Recoger el ID del usuario identificado
    const userId = req.user.id;

    // Recoger el ID del usuario que sigo y quiero dejar de seguir
    const followedId = req.params.id;

    // Find de las coincidencias y hacer remove
    Follow
        .find({ "user": userId, "followed": followedId })
        .deleteOne()
        .then((followDeleted) => {
            if (!followDeleted) return res.status(404).send({ status: "error", message: "No has dejado de seguir a nadie" });

            // Devolver el resultado
            return res.status(200).send({ status: "success", message: "Folow eliminado correctamente" });
        })
        .catch((error) => {
            return res.status(400).send({ status: "error", sysMessage: error.toString() })
        });
}

// Acción listado de usuarios que cualquier usuario está siguiendo (siguiendo)
const following = (req, res) => {
    // Scar el id del usuario identificado
    let userId = req.user.id;

    // Comprobar si me llega el id por parámetro en la url
    if (req.params.id) userId = req.params.id;

    // Comprobar si me llega la página, si no la página 1
    let page = 1;
    if (req.params.page) page = req.params.page;

    // Usuarios por página quiero mostrar
    const itemsPerPage = 5;

    // Find a follow, popular datos de los usuarios y paginar con mongoose pagination
    Follow
        .paginate({ user: userId }, { page: page, limit: itemsPerPage, populate: { path: "user followed", select: "-password -email -__v" } })
        .then(async (follows) => {

            // Listado de usuarios de "x", siendo yo "y"
            // Sacar un array de ids de los usuarios que me siguen y sigo como "x"
            let followUserIds = await followService.followUserIds(req.user.id);

            // Devolver el resultado
            return res.status(200).send({
                status: "success",
                message: "Listado de usuarios que estoy siguiendo",
                user_following: followUserIds.following,
                user_follow_me: followUserIds.followers
                //follows
            });
        })
        .catch((error) => {
            return res.status(400).send({ status: "error", sysMessage: error.toString() })
        });
}

// Acción listado de usuarios que cualquier usuario otro usuario (soy seguido, mis seguidores)
const followers = (req, res) => {
    // Scar el id del usuario identificado
    let userId = req.user.id;

    // Comprobar si me llega el id por parámetro en la url
    if (req.params.id) userId = req.params.id;

    // Comprobar si me llega la página, si no la página 1
    let page = 1;
    if (req.params.page) page = req.params.page;

    // Usuarios por página quiero mostrar
    const itemsPerPage = 5;

    // Find a follow, popular datos de los usuarios y paginar con mongoose pagination
    Follow
        .paginate({ followed: userId }, { page: page, limit: itemsPerPage, populate: { path: "user followed", select: "-password -email -role -__v" } })
        .then(async (follows) => {

            let followUserIds = await followService.followUserIds(req.user.id);

            // Devolver el resultado
            return res.status(200).send({
                status: "success",
                message: "Listado de usuarios que me siguen",
                follows,
                user_following: followUserIds.following,
                user_follow_me: followUserIds.followers
            });
        })
        .catch((error) => {
            return res.status(400).send({ status: "error", sysMessage: error.toString() })
        });
}

// Exportar acciones
module.exports = {
    pruebaFollow,
    save,
    unfollow,
    following,
    followers
}