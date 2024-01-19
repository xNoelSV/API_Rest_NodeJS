const fs = require("fs");
const path = require("path");
const { validarArticulo } = require("../helpers/validar");
const Articulo = require("../modelos/Articulo");

const prueba = (req, res) => {
    return res.status(200).json({
        mensaje: "Soy una accion de prueba en mi controlador de articulos"
    });
}

const curso = (req, res) => {
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
};

const crear = (req, res) => {

    // Recoger parámetros por post a guardar
    let parametros = req.body;

    // Validar los datos
    try {
        validarArticulo(parametros);
    } catch (error) {
        return res.status(400).json({
            status: "error",
            mensaje: "Faltan datos por enviar"
        });
    }

    // Crear el objeto a guardar
    const articulo = new Articulo(parametros);

    // Asignar valores a objeto basado en el modelo (manual o automático)
    // articulo.titulo = parametros.titulo;

    // Guardar el artículo en la base de datos
    /*
    articulo.save((error, articuloGuardado) => {
        
        if (error || !articuloGuardado) {
            return res.status(400).json({
                status: "error",
                mensaje: "No se ha guardado el artículo"
            });
        }

        // Devolver resultado
        return res.status(200).json({
            status: "success",
            articulo: articuloGuardado,
            mensaje: "Articulo creado con exito!!"
        })

    })
    */
    articulo.save().then((articuloGuardado) => {
        return res.status(200).json({
            status: "Success",
            article: articuloGuardado,
            message: "Articulo guardado correctamente!!"
        });
    }).catch((error) => {
        console.error(error);
        return res.status(400).json({
            status: "error",
            message: "Articulo no guardado"
        });
    });

}

const listar = (req, res) => {
    let consulta = Articulo.find({});

    if (req.params.ultimos == 1) {
        consulta.limit(1);
    }

    consulta.sort({
        fecha: -1
    })
        .then((articulos) => {
            if (!articulos) {
                return res.status(404).json({
                    status: "error",
                    mensaje: "No se han encontrado articulos",
                });
            }
            return res.status(200).send({
                status: "success, data recived",
                contador: articulos.length,
                articulos,
            });
        })
        .catch((error) => {
            return res.status(500).json({
                status: "error",
                mensaje: "Ha ocurrido un error al listar los articulos",
                error: error.message,
            });
        });

}

const uno = (req, res) => {
    // Recoger un id por la url
    let articuloId = req.params.id;

    // Buscar artículo
    Articulo.findById(articuloId)
        .then((articulo) => {
            // Si no existe, devolver error
            if (!articulo) {
                return res.status(500).json({
                    status: "Error",
                    mensaje: "No se ha encontrado el artículo",
                });
            }

            // Devolver resultado
            return res.status(200).json({
                status: "Success",
                articulo,
            });
        })
        .catch((error) => {
            return res.status(400).json({
                status: "Error",
                mensaje: "Ha ocurrido un error al buscar el artículo",
            });
        });
}

const borrar = (req, res) => {

    // Obtenemos una id por parámetro
    let articuloId = req.params.id;

    // Buscamos el objeto por su ID y lo borramos de la base de datos
    Articulo.findOneAndDelete({ _id: articuloId })
        .then((articuloBorrado) => {
            if (!articuloBorrado) {
                return res.status(500).json({
                    status: "Error",
                    mensaje: "No se ha encontrado el artículo",
                });
            }

            return res.status(200).json({
                status: "Success",
                articulo: articuloBorrado,
                mensaje: "Método de borrar"
            });
        })
        .catch((error) => {
            return res.status(400).json({
                status: "Error",
                mensaje: "Ha ocurrido un error al buscar el artículo",
            });
        });
}

const editar = (req, res) => {

    // Recoger id del cliente a editar
    let articuloId = req.params.id;

    // Recoger datos del body
    let parametros = req.body;

    // Validar datos
    try {
        validarArticulo(parametros);
    } catch (error) {
        return res.status(400).json({
            status: "error",
            mensaje: "Faltan datos por enviar"
        });
    }

    // Buscar y actualizar artículo
    Articulo.findOneAndUpdate({ _id: articuloId }, req.body, { new: true })
        .then((articuloActualizado) => {

            // Si no se encuentran articulos
            if (!articuloActualizado) {
                return res.status(500).json({
                    status: "Error",
                    mensaje: "No se ha encontrado el artículo",
                });
            }

            // Devolver respuesta
            return res.status(200).json({
                status: "Success",
                articulo: articuloActualizado
            })
        })
        .catch((error) => {
            return res.status(400).json({
                status: "Error",
                mensaje: error.toString(),
            });
        });

}

const subir = (req, res) => {

    // Configurar multer

    // Recoger el fichero de imagen subido
    if (!req.file && !req.files) {
        return res.status(404).json({
            status: "error",
            mensaje: "Petición invalida"
        })
    }
    console.log(req.file);

    // Nombre de la imagen
    let archivo = req.file.originalname;

    // Extensión del archivo
    let archivo_split = archivo.split("\.");
    let archivo_extension = archivo_split[1];

    // Comprobar extensión correcta
    if (archivo_extension != "png" && archivo_extension != "jpg" && archivo_extension != "jpeg" && archivo_extension != "gif") {

        // Borrar archivo y dar respuesta
        fs.unlink(req.file.path, (error) => {
            return res.status(400).json({
                status: "error",
                mensaje: "Imagen invalida"
            })
        })

    } else {

        // Si todo va bien actualizaremos el articulo donde subiremos la imagen
        // Recoger id del cliente a editar
        let articuloId = req.params.id;

        // Buscar y actualizar artículo
        Articulo.findOneAndUpdate({ _id: articuloId }, { imagen: req.file.filename }, { new: true })
            .then((articuloActualizado) => {
                // Si no se encuentran articulos
                if (!articuloActualizado) {
                    return res.status(500).json({
                        status: "Error",
                        mensaje: "Error al actualizar",
                    });
                }

                // Devolver respuesta
                return res.status(200).json({
                    status: "Success",
                    articulo: articuloActualizado,
                    fichero: req.file
                });
            })
            .catch((error) => {
                return res.status(400).json({
                    status: "Error",
                    mensaje: error.toString(),
                });
            });
    }
}

const imagen = (req, res) => {
    let nombreImagen = req.params.fichero;

    Articulo.findOne({ imagen: nombreImagen })
        .then((articulo) => {
            if (!articulo) {
                return res.status(404).json({
                    status: "error",
                    message: "No existe el articulo"
                });
            }

            let filePath = "./imagenes/articulos/" + articulo.imagen;

            fs.stat(filePath, (error, exists) => {
                if (!exists) {
                    return res.status(404).json({
                        status: "error",
                        articulo: articulo.imagen,
                        mensaje: "La imagen no existe"
                    });
                } else {
                    return res.sendFile(path.resolve(filePath));
                }
            });
        })
        .catch((error) => {
            return res.status(404).json({
                status: "error",
                mensaje: "La imagen no existe"
            });
        });
}

const buscar = async (req, res) => {
    
    // Sacar el string de busqueda
    let busqueda = req.params.busqueda
    
    // Find OR y puedes aplicar expresiones reg
    await Articulo.find({
        "$or": [
            { "titulo": { "$regex": busqueda, "$options": "i" } },
            { "contenido": { "$regex": busqueda, "$options": "i" } }
        ]
    })
    .sort({ fecha: -1 }) // Orden
    .exec() // Ejecutar consulta
    .then((articulos) => {
        // Si no se devuelven resultados
        if (!articulos || articulos.length < 1) {
            return res.status(404).json({
                status: "error",
                mensaje: "No hay articulos que coincidan"
            })
        }

        // Devolver resultado
        return res.status(200).json({
            status: "success",
            articulos
        })
    })
    // Captura de errores
    .catch((error) => {
        return res.status(404).json({
            status: "error",
            mensaje: "Fallo la algo a la hora de realizarla busqueda "
        })
    });
}

module.exports = {
    prueba,
    curso,
    crear,
    listar,
    uno,
    borrar,
    editar,
    subir,
    imagen,
    buscar
}