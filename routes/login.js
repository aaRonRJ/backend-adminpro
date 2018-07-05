var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

var Usuario = require('../models/usuario');
var config = require('../config/config');
const client = new OAuth2Client(config.CLIENT_ID);

var app = express();

app.post('/', (req, resp) => {
    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) {
            return resp.status(500).json({
                ok: false,
                message: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuarioDB) {
            return resp.status(400).json({
                ok: false,
                message: 'Credenciales incorrectas - email',
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return resp.status(400).json({
                ok: false,
                message: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        usuarioDB.password = ':)';

        // Crear token
        var token = jwt.sign({ usuario: usuarioDB }, config.SEED, { expiresIn: 14400 }); // Expira en 4 horas.

        resp.status(200).send({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        });
    });
});

/* Autenticación de Google */
app.post('/google', async(req, res) => {
    var token = req.body.token;

    var googleUser = await verify(token)
        .catch(err => {
            return res.status(403).json({
                ok: false,
                message: 'Token no válido'
            });
        });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return resp.status(500).json({
                ok: false,
                message: 'Error al buscar usuario',
                errors: err
            });
        }

        if (usuarioDB) {
            if (!usuarioDB.google) {
                return resp.status(400).json({
                    ok: false,
                    message: 'Debe de usar su autenticación normal'
                });
            } else {
                // Crear nuevo token
                var token = jwt.sign({ usuario: usuarioDB }, config.SEED, { expiresIn: 14400 }); // Expira en 4 horas.

                res.status(200).send({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id
                });
            }
        } else {
            // El usuario no existe... hay que crearlo
            var usuario = new Usuario();

            usuario.name = googleUser.name;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            Usuario.save((err, usuarioDB) => {
                if (err) {
                    return resp.status(500).json({
                        ok: false,
                        message: 'Error al crear usuario',
                        errors: err
                    });
                }

                // Crear token
                var token = jwt.sign({ usuario: usuarioDB }, config.SEED, { expiresIn: 14400 }); // Expira en 4 horas.

                res.status(200).send({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id
                });
            });
        }
    });
});

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: config.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        name: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    };
}

module.exports = app;