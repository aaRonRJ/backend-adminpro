var express = require('express');
var app = express();

const path = require('path');
const fs = require('fs');

// Rutas.
app.get('/:tipo/:img', (req, res, next) => {
    var img = req.params.img;
    var tipo = req.params.tipo;

    var pathImagen = path.resolve(__dirname, `../uploads/${ tipo }/${ img }`);

    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen);
    } else {
        var pathNoImage = path.resolve(__dirname, '../assets/no-img.jpg');
        res.sendFile(pathNoImage);
    }
});

module.exports = app;