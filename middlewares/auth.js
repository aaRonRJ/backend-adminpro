var jwt = require('jsonwebtoken');
var config = require('../config/config');

/* Verificar token */
exports.verificarToken = function(req, resp, next) {
    var token = req.query.token;

    jwt.verify(token, config.SEED, (err, decoded) => {
        if (err) {
            return resp.status(401).json({
                ok: false,
                message: 'Token incorrecto',
                errors: err
            });
        }

        req.usuario = decoded.usuario;

        next(); // Avisa de que puede continuar con las siguientes funciones.
    });
};