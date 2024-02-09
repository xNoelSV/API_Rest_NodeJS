// Importar mongoose
const mongoose = require("mongoose");

// Método de conexión
const conexion = async() => {

    try {
        await mongoose.connect("mongodb+srv://noelsava25:sa8ApXluKgyaZDgN@blog.otgkqmv.mongodb.net/app_musica");

        // Parámetros dentro de objeto // solo en caso de aviso
        // useNewUrlParser: true
        // useUnifiedTopology: true
        // useCreateIndex: true

        console.log("Conectado correctamente a la base de datos \"app_musica\"");
    } catch (error) {
        console.log(error);
        throw new Error("No se ha podido conectar a la base de datos");
    }

} // sa8ApXluKgyaZDgN

// Exportar conexión
module.exports = conexion;