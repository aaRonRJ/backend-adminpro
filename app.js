// Requires (importación de librerías).
var express = require('express');
var mongoose = require('mongoose');

// Inicializar variables.
var app = express();

// Conexión a la base de datos.
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (error, response) => {
    if (error) throw error;

    console.log('Base de datos. \x1b[32m%s\x1b[0m', 'ONLINE.');
});

// Rutas.
app.get('/', (request, response, next) => {
    response.status(200).json({
        ok: true,
        message: 'Petición realizada correctamente'
    });
});

// Escuchar peticiones.
app.listen(3088, () => {
    console.log('Express server, puerto 3088. \x1b[32m%s\x1b[0m', 'ONLINE.');
});