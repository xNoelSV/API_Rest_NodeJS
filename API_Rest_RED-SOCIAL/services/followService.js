// Importación de módulos
const Follow = require("../models/follow");

// Listado de todos los usuarios (me siguen y sigo)
const followUserIds = async (identityUserId) => {
    try {
        // Usuarios que sigo
        let following = await Follow.find({ "user": identityUserId })
            .select({ "followed": 1, "_id": 0 })
            //.populate({ path: "followed", select: { "name": 1, "surname": 1, "email": 1 } })
            .exec();

        // Usuarios que me siguen
        let followers = await Follow.find({ "followed": identityUserId })
            .select({ "user": 1, "_id": 0 })
            //.populate({ path: "user", select: { "_id": 0, "name": 1, "surname": 1, "email": 1 } })
            .exec();

        // Procesar a array de identificadores
        let followingClean = []
        following.forEach(follow => {
            followingClean.push(follow.followed);
        });

        let followersClean = []
        followers.forEach(follow => {
            followersClean.push(follow.user);
        });

        return {
            following: followingClean,
            followers: followersClean
        }

    } catch (error) {
        return { error: "error followService.js" };
    }
}

// Comprobar si un usuario me sigue y yo lo sigo
const followThisUser = async (identityUserId, profileUserId) => {
    // Usuarios que sigo
    let following = await Follow.findOne({ "user": identityUserId, "followed": profileUserId })
        //.select({ "followed": 1, "_id": 0 })
        //.populate({ path: "followed", select: { "name": 1, "surname": 1, "email": 1 } })
        //.exec();

    // Usuarios que me siguen
    let follower = await Follow.findOne({ "user": profileUserId, "followed": identityUserId })
        //.select({ "user": 1, "_id": 0 })
        //.populate({ path: "user", select: { "_id": 0, "name": 1, "surname": 1, "email": 1 } })
        //.exec();

    return {
        following,
        follower
    }
}

module.exports = {
    followUserIds,
    followThisUser
}