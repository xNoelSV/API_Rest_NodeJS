const mongoose = require("mongoose");

const connection = async() => {
    try {
        await mongoose.connect("mongodb+srv://noelsava25:sa8ApXluKgyaZDgN@blog.otgkqmv.mongodb.net/mi_redsocial");
        //await mongoose.connect("mongodb://localhost:27017/mi_redsocial");
        console.log("Conectado correctamente a bd: mi_redsocial");
    } catch (error) {
        console.log(error.toString());
        throw new Error("No se ha podido conectar a la base de datos!!")
    }
}
// sa8ApXluKgyaZDgN

module.exports = connection;
