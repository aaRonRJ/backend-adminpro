var express = require('express');
var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

/* Búsqueda por colección */
app.get('/coleccion/:tabla/:busqueda', (req, resp) => {
    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');
    var promesa;

    switch (tabla) {
        case 'medicos':
            promesa = buscarMedicos(busqueda, regex);
            break;

        case 'hospitales':
            promesa = buscarHospitales(busqueda, regex);
            break;

        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex);
            break;

        default:
            return resp.status(400).json({
                ok: false,
                message: 'Los tipos de búsqueda sólo son: usuarios, médicos y hospitales',
                error: { message: 'Tipo de tabla/colección no válido' }
            });
    }

    promesa
        .then(response => {
            resp.status(200).json({
                ok: true,
                [tabla]: response
            });
        });
});

/* Búsqueda en todo */
app.get('/todo/:busqueda', (request, resp, next) => {
    var busqueda = request.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    Promise.all(
            [
                buscarHospitales(regex),
                buscarMedicos(regex),
                buscarUsuarios(regex)
            ])
        .then(responses => {
            resp.status(200).json({
                ok: true,
                hospitales: responses[0],
                medicos: responses[1],
                usuarios: responses[2]
            });
        });
});

function buscarHospitales(regex) {
    return new Promise((resolve, reject) => {
        Hospital
            .find({ name: regex })
            .populate('usuario', 'name email')
            .exec((err, hospitales) => {
                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospitales);
                }
            });
    });
}

function buscarMedicos(regex) {
    return new Promise((resolve, reject) => {
        Medico
            .find({ name: regex })
            .populate('hospital')
            .populate('usuario', 'name email')
            .exec((err, medicos) => {
                if (err) {
                    reject('Error al cargar médicos', err);
                } else {
                    resolve(medicos);
                }
            });
    });
}

function buscarUsuarios(regex) {
    return new Promise((resolve, reject) => {
        Usuario
            .find({}, "name email role")
            .or([{ 'name': regex }, { 'email': regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            });
    });
}

module.exports = app;