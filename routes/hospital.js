var express = require('express');
var auth = require('../middlewares/auth');

var app = express();

// Models.
var Hospital = require('../models/hospital');

/* Obtener todos los hospitales */
app.get('/', (req, resp) => {
    var limit = req.query.limit || 0;
    var from = req.query.from || 0;
    from = Number(from);

    Hospital
        .find({})
        .skip(from)
        .limit(limit)
        .populate('usuario', 'name email')
        .exec((err, hospitales) => {
            if (err) {
                return resp.status(500).json({
                    ok: false,
                    message: 'Error cargando hospitales',
                    errors: err
                });
            }

            Hospital.count({}, (err, total) => {
                resp.status(200).json({
                    ok: true,
                    hospitales: hospitales,
                    total: total
                });
            });
        });
});

/* Crear un hospital */
app.post('/', auth.verificarToken, (req, resp) => {
    var body = req.body;

    var hospital = new Hospital({
        name: body.name,
        img: body.img,
        usuario: req.usuario
    });

    hospital.save(
        (err, hospitalGuardado) => {
            if (err) {
                return resp.status(400).json({
                    ok: false,
                    message: 'Error al crear hospital',
                    errors: err
                });
            }

            resp.status(201).json({
                ok: true,
                hospital: hospitalGuardado
            });
        }
    );
});

/* Actualizar hospital */
app.put('/:id', auth.verificarToken, (req, resp) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return resp.status(500).json({
                ok: false,
                message: 'Error al buscar hospital',
                errors: err
            });
        }

        if (!hospital) {
            return resp.status(400).json({
                ok: false,
                message: 'El hospital con el id' + id + 'no existe',
                errors: { message: 'No existe un hospital con ese id' }
            });
        }

        hospital.name = body.name;
        hospital.img = body.img;
        hospital.usuario = req.usuario;

        hospital.save(
            (err, hospitalActualizado) => {
                if (err) {
                    return resp.status(400).json({
                        ok: false,
                        message: 'Error al actualizar hospital',
                        errors: err
                    });
                }

                resp.status(200).json({
                    ok: true,
                    hospital: hospitalActualizado
                });
            }
        );
    });
});

/* Eliminar hospital */
app.delete('/:id', auth.verificarToken, (req, resp) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalEliminado) => {
        if (err) {
            return resp.status(500).json({
                ok: false,
                message: 'Error al borrar hospital',
                errors: err
            });
        }

        if (!hospitalEliminado) {
            return resp.status(400).json({
                ok: false,
                message: 'No existe un hospital con ese id',
                errors: { message: 'No existe un hospital con ese id' }
            });
        }

        resp.status(200).json({
            ok: true,
            hospital: hospitalEliminado
        });
    });
});

module.exports = app;