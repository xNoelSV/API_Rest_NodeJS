const { conexion } = require("./basedatos/conexion");
const express = require("express");
const cors = require("cors");

// Inicializar app
console.log("App de node arrancada");

// Conectar a la base de datos
conexion();

// Crear servidor Node
const app = express();
const puerto = 3900;

// Configurar cors
app.use(cors());

// Convertir body a objeto js
app.use(express.json()); // Recibir datos con content-type app/json
app.use(express.urlencoded({extended: true})); // form-urlencoded

// RUTAS
const rutas_articulo = require("./rutas/articulo");

// Cargo las rutas
app.use("/api", rutas_articulo)

/* Rutas prueba hardcodeadas
app.get("/probando", (req, res) => {
    console.log("Se ha ejecutado el endpoint \"probando\"");
    return res.status(200).json([{
        curso: "Master en React",
        autor: "Noel Sariñena Varela",
        url: "noelsarinenaweb.es/master-react"
    },
    {
        curso: "Master en PHP",
        autor: "Noel Sariñena Varela",
        url: "noelsarinenaweb.es/master-php"
    }])
    /*
    `
        <div>
            <h1>Probando ruta nodejs</h1>
            <p>Creando api rest con node</p>
            <ul>
                <li>Master en React</li>
                <li>Master en PHP</li>
            </ul>
        </div>
    `
    */
//});

app.get("/", (req, res) => {
    return res.status(200).send(
        "<h1>Empezando a crear un api rest con node</h1>"
    );
});

// Crear servidor y escuchar peticiones http
app.listen(puerto, () => {
    console.log("Servidor corriendo en el puerto " + puerto);
});