var express = require('express');
var auth = require('../middlewares/auth');

var app = express();

// Models.
var Medico = require('../models/medico');

/* Obtener todos los médicos */
app.get('/', (req, resp) => {
    var limit = req.query.limit || 0;
    var from = req.query.from || 0;
    from = Number(from);

    Medico
        .find({})
        .skip(from)
        .limit(limit)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medicos) => {
            if (err) {
                return resp.status(500).json({
                    ok: false,
                    message: 'Error cargando medicos',
                    errors: err
                });
            }

            Medico.count({}, (err, total) => {
                resp.status(200).json({
                    ok: true,
                    medicos: medicos,
                    total: total
                });
            });
        });
});

/* Crear un médico */
app.post('/', auth.verificarToken, (req, resp) => {
    var body = req.body;

    var medico = new Medico({
        name: body.name,
        img: body.img,
        hospital: body.hospital,
        usuario: req.usuario
    });

    medico.save(
        (err, medicoGuardado) => {
            if (err) {
                return resp.status(400).json({
                    ok: false,
                    message: 'Error al crear médico',
                    errors: err
                });
            }

            resp.status(201).json({
                ok: true,
                medico: medicoGuardado
            });
        }
    );
});

/* Actualizar médico */
app.put('/:id', auth.verificarToken, (req, resp) => {
    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {
        if (err) {
            return resp.status(500).json({
                ok: false,
                message: 'Error al buscar médico',
                errors: err
            });
        }

        if (!medico) {
            return resp.status(400).json({
                ok: false,
                message: 'El médico con el id' + id + 'no existe',
                errors: { message: 'No existe un médico con ese id' }
            });
        }

        medico.name = body.name;
        medico.img = body.img;
        medico.hospital = body.hospital;
        medico.usuario = req.usuario;

        medico.save(
            (err, medicoActualizado) => {
                if (err) {
                    return resp.status(400).json({
                        ok: false,
                        message: 'Error al actualizar médico',
                        errors: err
                    });
                }

                resp.status(200).json({
                    ok: true,
                    medico: medicoActualizado
                });
            }
        );
    });
});

/* Eliminar médico */
app.delete('/:id', auth.verificarToken, (req, resp) => {
    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoEliminado) => {
        if (err) {
            return resp.status(500).json({
                ok: false,
                message: 'Error al borrar médico',
                errors: err
            });
        }

        if (!medicoEliminado) {
            return resp.status(400).json({
                ok: false,
                message: 'No existe un médico con ese id',
                errors: { message: 'No existe un médico con ese id' }
            });
        }

        resp.status(200).json({
            ok: true,
            hospital: medicoEliminado
        });
    });
});

module.exports = app;