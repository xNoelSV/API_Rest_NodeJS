// Importar conexión a la base de datos
const connection = require("./database/connection");

// Importar dependencias
const express = require("express");
const cors = require("cors");

// Mensaje de bienvenida
console.log("API REST con Node para la app de musica arrancada.")

// Ejecutar conexión a la base de datos
connection();

// Crear servidor de node
const app = express();
const port = 3900;

// Configurar CORS
app.use(cors());

// Convertir datos del body a objetos JavaScript
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cargar configuración de rutas
const AlbumRouter = require("./routes/album");
const ArtistRouter = require("./routes/artist");
const SongRouter = require("./routes/song");
const UserRouter = require("./routes/user");

// Cargar rutas
app.use("/api/album", AlbumRouter);
app.use("/api/artist", ArtistRouter);
app.use("/api/song", SongRouter);
app.use("/api/user", UserRouter);

// Ruta de prueba
app.get("/", (req, res) => {
    return res.status(200).send("Ruta de prueba con texto plano");
})

// Poner el servidor a escuchar peticiones HTTP
app.listen(port, () => {
    console.log("Servidor de node está escuchando en el puerto: ", port);
})