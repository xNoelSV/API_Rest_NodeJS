// Importar dependencias
const connection = require("./database/connection");
const express = require("express");
const cors = require("cors");

// Mensaje de bienvenida
console.log("API NODE para RED SOCIAL arrancada!");

// Conexion a BBDD
connection();

// Crear servidor node
const app = express();
const port = 3900;

// Configurar CORS
app.use(cors());

// Convertir los datos del body a objetos JS
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Cargar configuración de rutas
const UserRoutes = require("./routes/user");
const PublciationRoutes = require("./routes/publication");
const FollowRoutes = require("./routes/follow");

app.use("/api/user", UserRoutes);
app.use("/api/publication", PublciationRoutes);
app.use("/api/follow", FollowRoutes);

// Ruta de prueba
app.get("/ruta-prueba", (req, res) => {
    return res.status(200).json(
        {
            "id": 1,
            "nombre": "Noel",
            "web": "portafoliodenoel.netlify.com"
        }
    )
})

// Poner el servidor a escuchar peticiones http
app.listen(port, () => {
    console.log("Servidor de node corriendo en el puerto: " + port);
});