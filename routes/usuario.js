var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var app = express();

var Usuario = require('../models/usuario');
var auth = require('../middlewares/auth');

/* Obtener todos los usuarios */
app.get('/', (request, response, next) => {
    var limit = request.query.limit || 0;
    var from = request.query.from || 0;
    from = Number(from);

    Usuario
        .find({}, 'name email img role')
        .skip(from)
        .limit(limit)
        .exec(
            (err, users) => {
                if (err) {
                    return response.status(500).json({
                        ok: false,
                        message: 'Error cargando usuarios',
                        errors: err
                    });
                }

                Usuario.count({}, (err, conteo) => {
                    response.status(200).json({
                        ok: true,
                        usuarios: users,
                        total: conteo
                    });
                });
            }
        );
});

/* Crear un usuario */
app.post('/', auth.verificarToken, (req, res) => {
    var body = req.body;
    var usuario = new Usuario({
        name: body.name,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save(
        (err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error al crear usuario',
                    errors: err
                });
            }

            res.status(201).json({
                ok: true,
                usuario: usuarioGuardado,
                usuarioToken: req.usuario
            });
        }
    );
});

/* Actualizar usuario */
app.put('/:id', (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                message: 'El usuario con el id' + id + 'no existe',
                errors: { message: 'No existe un usuario con ese id' }
            });
        }

        usuario.name = body.name;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save(
            (err, usuarioGuardado) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        message: 'Error al actualizar usuario',
                        errors: err
                    });
                }

                usuarioGuardado.password = ':)';

                res.status(200).json({
                    ok: true,
                    usuario: usuarioGuardado
                });
            }
        );
    });
});

/* Eliminar usuario */
app.delete('/:id', (req, res) => {
    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al borrar usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                message: 'No existe un usuario con ese id',
                errors: { message: 'No existe un usuario con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
});

module.exports = app;