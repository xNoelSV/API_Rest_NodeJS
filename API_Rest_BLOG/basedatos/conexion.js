const mongoose = require("mongoose");

const conexion = async() => {

    try {
        await mongoose.connect("mongodb://localhost:27017/mi_blog");

        // Parámetros dentro de objeto // solo en caso de aviso
        // useNewUrlParser: true
        // useUnifiedTopology: true
        // useCreateIndex: true

        console.log("Conectado correctamente a la base de datos \"mi_blog\"");
    } catch (error) {
        console.log(error);
        throw new Error("No se ha podido conectar a la base de datos");
    }

}

module.exports = {
    conexion
}