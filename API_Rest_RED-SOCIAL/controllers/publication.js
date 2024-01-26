// Acciones de prueba
const pruebPublication = (req, res) => {
    return res.status(200).send({
        mensaje: "Mensaje enviado desde: Controllers/publication.js"
    });
}

// Exportar acciones
module.exports = {
    pruebPublication
}