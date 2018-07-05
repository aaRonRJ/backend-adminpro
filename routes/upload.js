var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

// Models
var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// Middleware (default options)
app.use(fileUpload());

// Rutas.
app.put('/:tipo/:id', (req, res, next) => {
    var tipo = req.params.tipo;
    var id = req.params.id;

    // tipos de colección
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            message: 'Tipo de colección no es válida',
            error: { message: 'Tipo de colección no es válida' }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            message: 'No seleccionó nada',
            error: { message: 'Debe de seleccionar una imagen' }
        });
    }

    // Obtener nombre del archivo
    var file = req.files.imagen;
    var nombreCortado = file.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Solo estas extensiones aceptamos
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            message: 'Extensión no válida',
            error: { message: 'Las extensiones válidas son ' + extensionesValidas.join(', ') }
        });
    }

    // Nombre de archivo personalizado
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds }.${ extensionArchivo }`;

    // Mover el archivo del temporal a un path específico
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;

    file.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al mover archivo',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);
    });

    function subirPorTipo(tipo, id, nombreArchivo, res) {
        if (tipo === 'usuarios') {
            Usuario.findById(id, (err, usuario) => {
                if (!usuario) {
                    return res.status(400).json({
                        ok: false,
                        message: 'Usuario no existe',
                        errors: { message: 'Usuario no existe' }
                    });
                }

                var pathViejo = './uploads/usuarios/' + usuario.img;

                // Si existe, elimina la imagen anterior
                if (fs.existsSync(pathViejo)) {
                    fs.unlink(pathViejo);
                }

                usuario.img = nombreArchivo;

                usuario.save((err, usuarioActualizado) => {
                    usuarioActualizado.password = ':)';

                    return res.status(200).json({
                        ok: true,
                        message: 'Imagen de usuario actualizada',
                        usuario: usuarioActualizado
                    });
                });
            });
        }

        if (tipo === 'medicos') {
            Medico.findById(id, (err, medico) => {
                if (!medico) {
                    return res.status(400).json({
                        ok: false,
                        message: 'Médico no existe',
                        errors: { message: 'Médico no existe' }
                    });
                }

                var pathViejo = './uploads/medicos/' + medico.img;

                // Si existe, elimina la imagen anterior
                if (fs.existsSync(pathViejo)) {
                    fs.unlink(pathViejo);
                }

                medico.img = nombreArchivo;

                medico.save((err, medicoActualizado) => {
                    return res.status(200).json({
                        ok: true,
                        message: 'Imagen de médico actualizada',
                        medico: medicoActualizado
                    });
                });
            });
        }

        if (tipo === 'hospitales') {
            Hospital.findById(id, (err, hospital) => {
                if (!hospital) {
                    return res.status(400).json({
                        ok: false,
                        message: 'Hospital no existe',
                        errors: { message: 'Hospital no existe' }
                    });
                }

                var pathViejo = './uploads/hospitales/' + hospital.img;

                // Si existe, elimina la imagen anterior
                if (fs.existsSync(pathViejo)) {
                    fs.unlink(pathViejo);
                }

                hospital.img = nombreArchivo;

                hospital.save((err, hospitalActualizado) => {
                    return res.status(200).json({
                        ok: true,
                        message: 'Imagen de hospital actualizada',
                        hospital: hospitalActualizado
                    });
                });
            });
        }
    }

});

module.exports = app;